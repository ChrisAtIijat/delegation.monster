import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { getPublicKey } from '@iijat-sw/nip46';
import { NostrHelper } from 'src/app/common/nostr/nostrHelper';
import { KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { NidDocTypeCol } from 'src/app/models/rxdb/schemas/nid';
import { RxdbService } from 'src/app/services/rxdb.service';
import { v4 } from 'uuid';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-paste-key',
  templateUrl: './paste-key.component.html',
  styleUrls: ['./paste-key.component.scss'],
})
export class PasteKeyComponent {
  privkey: string | undefined;
  nick: string | undefined;

  get canImport(): boolean {
    if (!this.privkey || !this.nick) {
      return false;
    }

    try {
      NostrHelper.getNostrPrivkeyObject(this.privkey);
      return true;
    } catch (error) {
      return false;
    }
  }

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<PasteKeyComponent>,
    private _rxdbService: RxdbService
  ) {}

  async onClickImport() {
    if (!this.canImport) {
      return;
    }

    // Typescript
    if (!this.privkey || !this.nick) {
      return;
    }

    const privkeyObject = NostrHelper.getNostrPrivkeyObject(this.privkey);

    const dbNid = await this._rxdbService.db?.nids
      .findOne({
        selector: {
          col: NidDocTypeCol.Keys,
        },
      })
      .exec();

    const nextId = (dbNid?.nid ?? 0) + 1;

    this._rxdbService.db?.keys.insert({
      id: v4(),
      nick: this.nick,
      privkey: privkeyObject.hex,
      pubkey: getPublicKey(privkeyObject.hex),
      nid: nextId,
      usage: KeyDocTypeUsage.User,
      createdAt: new Date().toISOString(),
    });

    await this._rxdbService.db?.nids.upsert({
      id: dbNid?.id ?? v4(),
      nid: nextId,
      col: NidDocTypeCol.Keys,
    });

    this._bottomSheetRef.dismiss(true);
  }
}
