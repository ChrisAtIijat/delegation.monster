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
import { DelegationDocType } from 'src/app/models/rxdb/schemas/delegation';
import { DelegationHelper } from 'src/app/common/delegationHelper';

export type ApproveGetPublicKeyDialogData = {
  app: Nip46Uri;
};

export type ApproveGetPublicKeyDialogResponse = {
  pubkey: string | undefined;
  keyAndDelegation: KeyAndDelegation | undefined;
};

export class KeyAndDelegation {
  //delegatorNick: string | undefined;

  constructor(
    public key: RxDocument<KeyDocType> | undefined,
    public delegation: RxDocument<DelegationDocType> | undefined
  ) {}
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-approve-get-public-key-dialog',
  templateUrl: './approve-get-public-key-dialog.component.html',
  styleUrls: ['./approve-get-public-key-dialog.component.scss'],
})
export class ApproveGetPublicKeyDialogComponent implements OnInit {
  keys: RxDocument<KeyDocType>[] = [];
  delegations: RxDocument<DelegationDocType>[] = [];
  connection: RxDocument<AppDocType> | undefined;
  keysAndDelegations: KeyAndDelegation[] = [];
  selectedKeyAndDelegation: KeyAndDelegation | undefined;

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
      keyAndDelegation: undefined,
    };
    this._dialogRef.close(returnValue);
  }

  async approveWithIdentity() {
    if (
      !this.selectedKeyAndDelegation ||
      !this.connection ||
      !this._rxdbService.db
    ) {
      return;
    }

    const pubkey =
      this.selectedKeyAndDelegation.key?.pubkey ??
      this.selectedKeyAndDelegation.delegation?.delegatorPubkey;

    const returnValue = {
      pubkey,
      keyAndDelegation: this.selectedKeyAndDelegation,
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
        lastKeyId: this.selectedKeyAndDelegation.key?.id,
        lastDelegationId: this.selectedKeyAndDelegation.delegation?.id,
      });
    } else {
      // Update existing record.
      await response.update({
        $set: {
          lastKeyId: this.selectedKeyAndDelegation.key?.id,
          lastDelegationId: this.selectedKeyAndDelegation.delegation?.id,
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
          typeof x.delegatorNick !== 'undefined' &&
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

  private async _setSelectedKeyAndDelegation() {
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

    if (typeof response.lastKeyId !== 'undefined') {
      this.selectedKeyAndDelegation = this.keysAndDelegations.find(
        (x) => x.key?.id === response.lastKeyId
      );
    } else if (typeof response.lastDelegationId !== 'undefined') {
      this.selectedKeyAndDelegation = this.keysAndDelegations.find(
        (x) => x.delegation?.id === response.lastDelegationId
      );
    }
  }

  private _generateKeysAndDelegations() {
    this.keys.forEach((key) => {
      this.keysAndDelegations.push(new KeyAndDelegation(key, undefined));
    });

    this.delegations.forEach((delegation) => {
      this.keysAndDelegations.push(new KeyAndDelegation(undefined, delegation));
    });
  }
}
