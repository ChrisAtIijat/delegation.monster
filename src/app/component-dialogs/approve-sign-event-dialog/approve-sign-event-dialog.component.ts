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
import { DelegationHelper } from 'src/app/common/delegationHelper';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { Response } from 'src/app/models/rxdb/schemas/response';
import { DelegationDocType } from 'src/app/models/rxdb/schemas/delegation';
import { KeyDocType, KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { MixedService } from 'src/app/services/mixed.service';
import { RxdbService } from 'src/app/services/rxdb.service';
import { v4 } from 'uuid';

export type ApproveSignEventDialogData = {
  app: Nip46Uri;
  unsignedEvent: UnsignedEvent;
};

export type ApproveSignEventDialogResponse = {
  signedEvent: Event | undefined;
  keyAndDelegation: KeyAndDelegation | undefined;
};

export class KeyAndDelegation {
  //key: RxDocument<KeyDocType>;
  //delegation: RxDocument<DelegationDocType>;
  delegatorNick: string | undefined;

  constructor(
    public key: RxDocument<KeyDocType>,
    public delegation: RxDocument<DelegationDocType> | undefined = undefined
  ) {}
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-approve-sign-event-dialog',
  templateUrl: './approve-sign-event-dialog.component.html',
  styleUrls: ['./approve-sign-event-dialog.component.scss'],
})
export class ApproveSignEventDialogComponent implements OnInit, OnDestroy {
  viewDetails = false;
  keys: RxDocument<KeyDocType>[] = [];
  delegations: RxDocument<DelegationDocType>[] = [];
  connection: RxDocument<AppDocType> | undefined;

  keysAndDelegations: KeyAndDelegation[] = [];

  selectedKeyAndDelegation: KeyAndDelegation | undefined;

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
    this._loadData();
  }

  ngOnDestroy(): void {
    this._keysSubscription?.unsubscribe();
    this._connectionSubscription?.unsubscribe();
  }

  getDetails() {
    return JSON.stringify(this.data.unsignedEvent, null, 2);
  }

  getKey(pubkey: string): RxDocument<KeyDocType> | undefined {
    return this.keys.find((x) => x.pubkey === pubkey);
  }

  decline() {
    const returnValue: ApproveSignEventDialogResponse = {
      signedEvent: undefined,
      keyAndDelegation: undefined,
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
      keyAndDelegation: undefined,
    };

    this._dialogRef.close(returnValue);
  }

  async signWithIdentity() {
    if (
      !this.selectedKeyAndDelegation ||
      !this.connection ||
      !this._rxdbService.db
    ) {
      return;
    }

    // Is the a signing "on behalf of"?
    if (this.selectedKeyAndDelegation.delegation) {
      // Yes. It is a signing "on behalf of".
      // Add delegation information to the unsigned event.
      if (typeof this.data.unsignedEvent.tags === 'undefined') {
        this.data.unsignedEvent.tags = [];
      }

      if (Array.isArray(this.data.unsignedEvent.tags)) {
        this.data.unsignedEvent.tags.push([
          'delegation',
          this.selectedKeyAndDelegation.delegation.delegatorPubkey,
          this.selectedKeyAndDelegation.delegation.conditions,
          this.selectedKeyAndDelegation.delegation.token,
        ]);
      }

      // Set delegatorNick
      const delegatorKey = this.getKey(
        this.selectedKeyAndDelegation.delegation.delegatorPubkey
      );
      this.selectedKeyAndDelegation.delegatorNick =
        delegatorKey?.nick ??
        this.selectedKeyAndDelegation.delegation.delegatorNick;
    }

    const id = getEventHash(this.data.unsignedEvent);
    const sig = getSignature(
      this.data.unsignedEvent,
      this.selectedKeyAndDelegation.key.privkey
    );

    const signedEvent: Event = {
      id,
      sig,
      ...this.data.unsignedEvent,
    };

    // Store selection for future requests.
    const response = await this._rxdbService.db.responses
      .findOne({
        selector: {
          appId: this.connection.id,
          response: Response.SignEvent + this.data.unsignedEvent.kind,
        },
      })
      .exec();
    if (!response) {
      // Insert new record.
      await this._rxdbService.db.responses.insert({
        id: v4(),
        appId: this.connection.id,
        response: Response.SignEvent + this.data.unsignedEvent.kind,
        lastKeyId: this.selectedKeyAndDelegation.key.id,
        lastDelegationId: this.selectedKeyAndDelegation.delegation?.id,
      });
    } else {
      // Update existing record.
      await response.update({
        $set: {
          lastKeyId: this.selectedKeyAndDelegation.key.id,
          lastDelegationId: this.selectedKeyAndDelegation.delegation?.id,
        },
      });
    }

    const returnValue: ApproveSignEventDialogResponse = {
      signedEvent,
      keyAndDelegation: this.selectedKeyAndDelegation,
    };

    this._dialogRef.close(returnValue);
  }

  private async _setSelectedKeyAndDelegation() {
    const response = await this._rxdbService.db?.responses
      .findOne({
        selector: {
          appId: this.connection?.id,
          response: Response.SignEvent + this.data.unsignedEvent.kind,
        },
      })
      .exec();

    if (!response) {
      return;
    }

    this.selectedKeyAndDelegation = this.keysAndDelegations.find(
      (x) =>
        x.key.id === response.lastKeyId &&
        x.delegation?.id === response.lastDelegationId
    );
  }

  private async _loadData() {
    await this._loadDelegations();
    await this._loadKeys();
    await this._loadConnection();
    this._generateKeysAndDelegations();
    await this._setSelectedKeyAndDelegation();
  }

  private async _loadDelegations() {
    const delegations = await this._rxdbService.db?.delegations.find({}).exec();

    this.delegations =
      delegations?.filter(
        (x) =>
          x.kinds.includes(this.data.unsignedEvent.kind) &&
          DelegationHelper.isActive(x.from, x.until)
      ) ?? [];
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

  private _generateKeysAndDelegations() {
    for (const key of this.keys) {
      // Add this key to keysAndDelegations.
      this.keysAndDelegations.push(new KeyAndDelegation(key));

      // Find delegation (if available).
      const delegations = this.delegations.filter(
        (x) => x.delegateePubkey === key.pubkey
      );
      delegations.forEach((delegation) => {
        // Add this delegation to keysAndDelegations.
        const newKeyAndDelegation = new KeyAndDelegation(key, delegation);
        newKeyAndDelegation.delegatorNick = this.getKey(
          delegation.delegatorPubkey
        )?.nick;
        this.keysAndDelegations.push(newKeyAndDelegation);
      });
    }
  }
}
