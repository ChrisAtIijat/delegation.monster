import { Injectable } from '@angular/core';
import {
  RxStorageInstanceDexie,
  getRxStorageDexie,
} from 'rxdb/plugins/storage-dexie';
import { appSchema } from '../models/rxdb/schemas/app';
import { DelmoDatabase } from '../models/rxdb/delmoDatabase';
import { DelmoCollections } from '../models/rxdb/delmoCollections';
import { sleep } from '../common/sleep';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { KeyDocTypeUsage, keySchema } from '../models/rxdb/schemas/key';
import { v4 } from 'uuid';
import { DateTime } from 'luxon';
import { NidDocTypeCol, nidSchema } from '../models/rxdb/schemas/nid';
import { LOCAL_STORAGE } from '../models/localStorage';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';
import { Subject } from 'rxjs';
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { generatePrivateKey, getPublicKey } from '@iijat-sw/nip46';

export enum RxdbServiceState {
  FirstTimeDbRun = 1,
  DbStartUpRequestUnlockCode = 2,
}

@Injectable({
  providedIn: 'root',
})
export class RxdbService {
  // #region Public Properties

  get db(): DelmoDatabase | undefined {
    return this._db;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  startupOutEvents = new Subject<RxdbServiceState>();
  errorOutEvent = new Subject<string>();
  unlockCodeEvents = new Subject<string>();

  // #endregion Public Properties

  // #region Private Properties

  private _isInitialized = false;
  private _db: DelmoDatabase | undefined;

  // #endregion Private Properties

  // #region Public Methods

  async waitForDb() {
    if (this._isInitialized) {
      return;
    }

    let ms = 0;

    do {
      await sleep(100);
      ms += 100;

      if (!this._isInitialized && ms >= 10000) {
        throw new Error('Database not ready timeout.');
      }
    } while (!this._isInitialized);
  }

  async initDb(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    // console.log(isDevMode());
    try {
      addRxPlugin(RxDBDevModePlugin);

      // if (isDevMode()) {
      //   await import('rxdb/plugins/dev-mode').then((module) => {
      //     console.log(module as any);
      //     addRxPlugin(module as any);
      //   });
      //   console.log('B');
      // }

      const start = DateTime.now();

      await sleep(1500);

      const password = await this._getDatabasePassword();

      const encryptedDexieStorage = wrappedKeyEncryptionCryptoJsStorage({
        storage: getRxStorageDexie(),
      });

      this._db = await createRxDatabase<DelmoCollections>({
        name: 'delmo',
        storage: encryptedDexieStorage,
        password,
      });

      await this._buildCollections();
      await this._seedData();

      localStorage.setItem(LOCAL_STORAGE.DB_IS_SET_UP, '1');

      const minMs = 2500;
      const duration =
        DateTime.now().diff(start, 'milliseconds').toObject().milliseconds ??
        minMs;
      if (minMs - duration > 0) {
        await sleep(minMs - duration);
      }

      addRxPlugin(RxDBUpdatePlugin);

      // Store the name of the indexedDbs to be able to delete them later.
      const currentNames: string[] = [];
      for (const storageInstance of this._db.storageInstances) {
        const originalInstance = storageInstance.originalStorageInstance;
        const dexie = await originalInstance.internals;

        const database = dexie['dexieDb'].idbdb as IDBDatabase;
        currentNames.push(database.name);
      }

      const namesString = localStorage.getItem(
        LOCAL_STORAGE.INDEXED_DB_NAMES_JSON
      );
      if (!namesString) {
        // First run.
        localStorage.setItem(
          LOCAL_STORAGE.INDEXED_DB_NAMES_JSON,
          JSON.stringify(currentNames)
        );
      } else {
        // Regular run.
        const namesJson = JSON.parse(namesString) as string[];
        const newNamesString = JSON.stringify(
          Array.from(new Set([...currentNames, ...namesJson]))
        );
        localStorage.setItem(
          LOCAL_STORAGE.INDEXED_DB_NAMES_JSON,
          newNamesString
        );
      }

      this._isInitialized = true;
    } catch (error) {
      console.log(error);
      this.errorOutEvent.next(JSON.stringify(error));
    }
  }

  async destroyDb() {
    const dbNames = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE.INDEXED_DB_NAMES_JSON) ?? '[]'
    ) as string[];
    // Destroy all IndexDBs found.
    for (const dbName of dbNames) {
      indexedDB.deleteDatabase(dbName);
    }

    // Reset database set up state in local storage.
    localStorage.setItem(LOCAL_STORAGE.DB_IS_SET_UP, '0');
    localStorage.removeItem(LOCAL_STORAGE.DB_TEST_PASSWORD);
    localStorage.removeItem(LOCAL_STORAGE.INDEXED_DB_NAMES_JSON);
  }

  // #endregion Public Methods

  // #region Private Methods

  private _getDatabasePassword(): Promise<string> {
    return new Promise((resolve, reject) => {
      let isVeryFirstRun = false;

      const dbIsInitialized = localStorage.getItem(LOCAL_STORAGE.DB_IS_SET_UP);
      if (dbIsInitialized !== '1') {
        isVeryFirstRun = true;
      } else {
        // This is not the first run. The DB already exists.

        const testDbPassword = localStorage.getItem(
          LOCAL_STORAGE.DB_TEST_PASSWORD
        );
        if (testDbPassword) {
          resolve(testDbPassword);
          return;
        }
      }

      // It is either the very first run or the user has set a password himself.

      const unlockCodeEventsSubscription = this.unlockCodeEvents.subscribe(
        (unlockCode) => {
          unlockCodeEventsSubscription.unsubscribe();
          resolve(unlockCode);
          return;
        }
      );

      if (isVeryFirstRun) {
        this.startupOutEvents.next(RxdbServiceState.FirstTimeDbRun);
      } else {
        this.startupOutEvents.next(RxdbServiceState.DbStartUpRequestUnlockCode);
      }
    });
  }

  private async _buildCollections() {
    await this._db?.addCollections({
      apps: {
        schema: appSchema,
      },
      keys: {
        schema: keySchema,
      },
      nids: {
        schema: nidSchema,
      },
    });
  }

  private async _seedData() {
    // Make sure that an initial signer key is available.
    const dbKey = await this._db?.keys
      .findOne({
        selector: {
          usage: KeyDocTypeUsage.Signer,
        },
      })
      .exec();

    if (!dbKey) {
      // Generate an initial privkey.
      const privkey = generatePrivateKey();
      const pubkey = getPublicKey(privkey);

      await this._db?.keys.insert({
        id: v4(),
        nid: 0,
        pubkey,
        privkey,
        usage: KeyDocTypeUsage.Signer,
        nick: 'Internal nostr identity for the NIP46 communication.',
        createdAt: new Date().toISOString(),
      });

      await this._db?.nids.insert({
        id: v4(),
        col: NidDocTypeCol.Keys,
        nid: 0,
      });
    }
  }

  // #endregion Private Methods
}
