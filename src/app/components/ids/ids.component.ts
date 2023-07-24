import { Component, OnInit } from '@angular/core';
import { RxDocument } from 'rxdb';
import { KeyDocType, KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { RxdbService } from 'src/app/services/rxdb.service';
import { v4 } from 'uuid';
import { uniqueNamesGenerator, starWars } from 'unique-names-generator';
import { NidDocTypeCol } from 'src/app/models/rxdb/schemas/nid';
import 'src/app/models/sortByExtension';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PasteKeyComponent } from 'src/app/component-helpers/paste-key/paste-key.component';
import { Subscription } from 'rxjs';
import { ConfirmService } from 'src/app/services/confirm.service';
import { generatePrivateKey, getPublicKey } from '@iijat-sw/nip46';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-ids',
  templateUrl: './ids.component.html',
  styleUrls: ['./ids.component.scss'],
})
export class IdsComponent implements OnInit {
  isNewIdVisible = false;
  isIdEditVisible = false;

  keys: RxDocument<KeyDocType>[] = [];
  selectedKey: RxDocument<KeyDocType> | undefined;

  keysSubscription: Subscription | undefined;

  constructor(
    private _rxdbService: RxdbService,
    private _bottomSheet: MatBottomSheet,
    private _confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this._loadKeys();
  }

  async importExistingKey() {
    const sheet = this._bottomSheet.open(PasteKeyComponent, {
      autoFocus: true,
    });
    sheet.afterDismissed().subscribe((ok) => {
      (document.activeElement as HTMLElement)?.blur();
    });
  }

  async generateNewKey() {
    const privkey = generatePrivateKey();
    const nick = uniqueNamesGenerator({ dictionaries: [starWars] });

    try {
      const dbNid = await this._rxdbService.db?.nids
        .findOne({
          selector: {
            col: NidDocTypeCol.Keys,
          },
        })
        .exec();

      const nextId = (dbNid?.nid ?? 0) + 1;

      this.selectedKey = await this._rxdbService.db?.keys.insert({
        id: v4(),
        nid: nextId,
        privkey: privkey,
        pubkey: getPublicKey(privkey),
        usage: KeyDocTypeUsage.User,
        nick,
        createdAt: new Date().toISOString(),
      });

      await this._rxdbService.db?.nids.upsert({
        id: dbNid?.id ?? v4(),
        nid: nextId,
        col: NidDocTypeCol.Keys,
      });
    } catch (error) {
      // TODO
      console.log(error);
    }
  }

  onClickKey(key: RxDocument<KeyDocType>) {
    this.selectedKey = key;
    this.isIdEditVisible = true;
  }

  private async _loadKeys() {
    this.keysSubscription = await this._rxdbService.db?.keys
      .find({
        selector: {
          usage: KeyDocTypeUsage.User,
        },
        sort: [{ createdAt: 'asc' }],
      })
      .$.subscribe((keys) => {
        this.keys = keys;
      });
  }

  async onChangeNick(event: any) {
    if (!this.selectedKey) {
      return;
    }

    const newNick = event.target.value as string;

    this.selectedKey = await this.selectedKey.update({
      $set: {
        nick: newNick,
      },
    });
  }

  async deleteIdentity() {
    if (!this.selectedKey) {
      return;
    }

    this._confirmService.open(
      'Please confirm',
      'Do you really want to delete this identity?',
      async () => {
        await this.selectedKey?.remove();
        this.isIdEditVisible = false;
      },
      undefined,
      async () => {
        (document.activeElement as HTMLElement)?.blur();
      }
    );
  }
}
