import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Event,
  Nip46Uri,
  UnsignedEvent,
  getEventHash,
  getSignature,
} from '@iijat-sw/nip46';
import { RxDocument } from 'rxdb';
import { Subscription } from 'rxjs';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { KeyDocType, KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { MixedService } from 'src/app/services/mixed.service';
import { RxdbService } from 'src/app/services/rxdb.service';

export type ApproveSignEventDialogData = {
  app: Nip46Uri;
  unsignedEvent: UnsignedEvent;
};

export type ApproveSignEventDialogResponse = {
  signedEvent: Event | undefined;
  key: RxDocument<KeyDocType> | undefined;
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-approve-sign-event-dialog',
  templateUrl: './approve-sign-event-dialog.component.html',
  styleUrls: ['./approve-sign-event-dialog.component.scss'],
})
export class ApproveSignEventDialogComponent implements OnInit, OnDestroy {
  viewDetails = false;
  keys: RxDocument<KeyDocType>[] | undefined;
  connection: RxDocument<AppDocType> | null = null;
  selectedKey: RxDocument<KeyDocType> | undefined;

  private _isSelectedKeyEvaluated = false;
  private _keysSubscription: Subscription | undefined;
  private _connectionSubscription: Subscription | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApproveSignEventDialogData,
    private _dialogRef: MatDialogRef<ApproveSignEventDialogComponent>,
    public mixedService: MixedService,
    private _rxdbService: RxdbService
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

  getDetails() {
    return JSON.stringify(this.data.unsignedEvent, null, 2);
  }

  decline() {
    const returnValue: ApproveSignEventDialogResponse = {
      signedEvent: undefined,
      key: undefined,
    };
    this._dialogRef.close(returnValue);
  }

  async signWithExtension() {
    if (!this.mixedService.isNip07BrowserExtensionAvailable) {
      return;
    }

    const signedEvent = await window.nostr?.signEvent(this.data.unsignedEvent);

    const returnValue: ApproveSignEventDialogResponse = {
      signedEvent,
      key: undefined,
    };

    this._dialogRef.close(returnValue);
  }

  async signWithIdentity() {
    if (!this.selectedKey || !this.connection) {
      return;
    }

    const id = getEventHash(this.data.unsignedEvent);
    const sig = getSignature(this.data.unsignedEvent, this.selectedKey.privkey);

    const signedEvent: Event = {
      id,
      sig,
      ...this.data.unsignedEvent,
    };

    // Store selectedKey for future requests.
    await this.connection.update({
      $set: {
        lastKeyId: this.selectedKey.id,
      },
    });

    const returnValue: ApproveSignEventDialogResponse = {
      signedEvent,
      key: this.selectedKey,
    };

    this._dialogRef.close(returnValue);
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
