import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Nip46Uri } from '@iijat-sw/nip46';
import { RxDocument } from 'rxdb';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { Response } from 'src/app/models/rxdb/schemas/response';
import { KeyDocType, KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { MixedService } from 'src/app/services/mixed.service';
import { RxdbService } from 'src/app/services/rxdb.service';
import { v4 } from 'uuid';

export type ApproveGetPublicKeyDialogData = {
  app: Nip46Uri;
};

export type ApproveGetPublicKeyDialogResponse = {
  pubkey: string | undefined;
  key: RxDocument<KeyDocType> | undefined;
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-approve-get-public-key-dialog',
  templateUrl: './approve-get-public-key-dialog.component.html',
  styleUrls: ['./approve-get-public-key-dialog.component.scss'],
})
export class ApproveGetPublicKeyDialogComponent implements OnInit {
  keys: RxDocument<KeyDocType>[] = [];
  connection: RxDocument<AppDocType> | undefined;
  selectedKey: RxDocument<KeyDocType> | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApproveGetPublicKeyDialogData,
    private _dialogRef: MatDialogRef<ApproveGetPublicKeyDialogComponent>,
    private _rxdbService: RxdbService,
    public mixedService: MixedService
  ) {}

  ngOnInit(): void {
    this._loadData();
  }

  decline() {
    const returnValue: ApproveGetPublicKeyDialogResponse = {
      pubkey: undefined,
      key: undefined,
    };
    this._dialogRef.close(returnValue);
  }

  async approveWithIdentity() {
    if (!this.selectedKey || !this.connection || !this._rxdbService.db) {
      return;
    }

    const returnValue = {
      pubkey: this.selectedKey.pubkey,
      key: this.selectedKey,
    };

    // Store the selection for future requests.
    const response = await this._rxdbService.db.responses
      .findOne({
        selector: {
          appId: this.connection.id,
          response: Response.GetPublicKey,
        },
      })
      .exec();

    if (!response) {
      // Insert new record.
      await this._rxdbService.db.responses.insert({
        id: v4(),
        appId: this.connection.id,
        response: Response.GetPublicKey,
        lastKeyId: this.selectedKey.id,
      });
    } else {
      // Update existing record.
      await response.update({
        $set: {
          lastKeyId: this.selectedKey.id,
        },
      });
    }

    this._dialogRef.close(returnValue);
  }

  async approveWithExtension() {
    if (!this.mixedService.isNip07BrowserExtensionAvailable) {
      return;
    }

    const pubkey = await window.nostr?.getPublicKey();

    this._dialogRef.close({
      pubkey,
      key: undefined,
    });
  }

  private async _loadData() {
    await this._loadKeys();
    await this._loadConnection();
    await this._setSelectedKey();
  }

  private async _loadKeys() {
    this.keys =
      (await this._rxdbService.db?.keys
        .find({
          selector: {
            usage: KeyDocTypeUsage.User,
          },
        })
        .exec()) ?? [];
  }

  private async _loadConnection() {
    this.connection =
      (await this._rxdbService.db?.apps
        .findOne({
          selector: {
            nostrConnectUri: this.data.app.toURI(),
          },
        })
        .exec()) ?? undefined;
  }

  private async _setSelectedKey() {
    const response = await this._rxdbService.db?.responses
      .findOne({
        selector: {
          appId: this.connection?.id,
          response: Response.GetPublicKey,
        },
      })
      .exec();

    if (!response) {
      return;
    }

    this.selectedKey = this.keys.find((x) => x.id === response.lastKeyId);
  }
}
