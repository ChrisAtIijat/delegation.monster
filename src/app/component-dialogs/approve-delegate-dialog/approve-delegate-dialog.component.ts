import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Nip46Uri,
  Nip46DelegateRequestParams,
  Nip46DelegateResponseResult,
} from '@iijat-sw/nip46';
import { RxDocument } from 'rxdb';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { KeyDocType, KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { Response } from 'src/app/models/rxdb/schemas/response';
import { RxdbService } from 'src/app/services/rxdb.service';
import { nip26 } from 'nostr-tools';
import { v4 } from 'uuid';

export type ApproveDelegateDialogData = {
  app: Nip46Uri;
  params: Nip46DelegateRequestParams;
};

export type ApproveDelegateDialogResponse = {
  delegation: Nip46DelegateResponseResult | undefined;
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-approve-delegate-dialog',
  templateUrl: './approve-delegate-dialog.component.html',
  styleUrls: ['./approve-delegate-dialog.component.scss'],
})
export class ApproveDelegateDialogComponent implements OnInit {
  viewDetails = false;
  keys: RxDocument<KeyDocType>[] = [];
  connection: RxDocument<AppDocType> | undefined;
  selectedKey: RxDocument<KeyDocType> | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApproveDelegateDialogData,
    private _dialogRef: MatDialogRef<ApproveDelegateDialogComponent>,
    private _rxdbService: RxdbService
  ) {}

  ngOnInit(): void {
    this._loadData();
  }

  getDetails() {
    return JSON.stringify(this.data.params, null, 2);
  }

  decline() {
    const returnValue: ApproveDelegateDialogResponse = {
      delegation: undefined,
    };
    this._dialogRef.close(returnValue);
  }

  async signWithIdentity() {
    if (!this.selectedKey || !this._rxdbService.db || !this.connection) {
      return;
    }

    const delegation = nip26.createDelegation(this.selectedKey.privkey, {
      kind: this.data.params[1].kind,
      since: this.data.params[1].since,
      until: this.data.params[1].until,
      pubkey: this.data.params[0],
    });

    // Store selection for future requests.
    const response = await this._rxdbService.db.responses
      .findOne({
        selector: {
          appId: this.connection.id,
          response: Response.Delegate + this.data.params[0],
        },
      })
      .exec();

    if (!response) {
      // Insert new record.
      await this._rxdbService.db.responses.insert({
        id: v4(),
        appId: this.connection.id,
        response: Response.Delegate + this.data.params[0],
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

    const returnValue: ApproveDelegateDialogResponse = {
      delegation: delegation,
    };
    this._dialogRef.close(returnValue);
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
          response: Response.Delegate + this.data.params[0],
        },
      })
      .exec();

    if (!response) {
      return;
    }

    if (typeof response.lastKeyId !== 'undefined') {
      this.selectedKey = this.keys.find((x) => x.id === response.lastKeyId);
    }
  }
}
