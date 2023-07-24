import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Nip46Uri } from '@iijat-sw/nip46';
import { RxDocument } from 'rxdb';
import { Subscription } from 'rxjs';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { KeyDocType, KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { MixedService } from 'src/app/services/mixed.service';
import { RxdbService } from 'src/app/services/rxdb.service';

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
export class ApproveGetPublicKeyDialogComponent implements OnInit, OnDestroy {
  keys: RxDocument<KeyDocType>[] | undefined;
  connection: RxDocument<AppDocType> | null = null;
  selectedKey: RxDocument<KeyDocType> | undefined;

  private _isSelectedKeyEvaluated = false;
  private _keysSubscription: Subscription | undefined;
  private _connectionSubscription: Subscription | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApproveGetPublicKeyDialogData,
    private _dialogRef: MatDialogRef<ApproveGetPublicKeyDialogComponent>,
    private _rxdbService: RxdbService,
    public mixedService: MixedService
  ) {}

  ngOnInit(): void {
    this._keysSubscription = this._rxdbService.db?.keys
      .find({
        selector: {
          usage: KeyDocTypeUsage.User,
        },
      })
      .$.subscribe((keys) => {
        this.keys = keys;
        this._evaluateSelectedKey();
      });

    this._connectionSubscription = this._rxdbService.db?.apps
      .findOne({
        selector: {
          nostrConnectUri: this.data.app.toURI(),
        },
      })
      .$.subscribe((connection) => {
        this.connection = connection;
        this._evaluateSelectedKey();
      });
  }

  ngOnDestroy(): void {
    this._keysSubscription?.unsubscribe();
    this._connectionSubscription?.unsubscribe();
  }

  decline() {
    const returnValue: ApproveGetPublicKeyDialogResponse = {
      pubkey: undefined,
      key: undefined,
    };
    this._dialogRef.close(returnValue);
  }

  approveWithIdentity() {
    if (!this.selectedKey) {
      return;
    }

    const returnValue = {
      pubkey: this.selectedKey.pubkey,
      key: this.selectedKey,
    };

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

  private _evaluateSelectedKey() {
    // Make sure that both the keys and the connection has been loaded from the local database.
    if (!this.keys || !this.connection) {
      return;
    }

    // Check if everything already was evaluated or if there actually is a "lastKeyId" available.
    if (this._isSelectedKeyEvaluated || !this.connection.lastKeyId) {
      return;
    }

    // Evaluate.
    this.selectedKey = this.keys.find(
      (x) => x.id === this.connection?.lastKeyId
    );

    // Make sure the evaluation is not running again.
    this._isSelectedKeyEvaluated = true;
  }
}
