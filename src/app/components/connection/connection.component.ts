import { KeyValue } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  EventTemplate,
  Nip46SignerEvent,
  Nip46Uri,
  UnsignedEvent,
} from '@iijat-sw/nip46';
import { RxDocument } from 'rxdb';
import { Nip46Log, Nip46LogLevel } from 'src/app/common/signerLog';
import {
  ApproveGetPublicKeyDialogComponent,
  ApproveGetPublicKeyDialogData,
  KeyAndDelegation,
} from 'src/app/component-dialogs/approve-dialog/approve-get-public-key-dialog.component';
import {
  ApproveSignEventDialogComponent,
  ApproveSignEventDialogData,
  ApproveSignEventDialogResponse,
} from 'src/app/component-dialogs/approve-sign-event-dialog/approve-sign-event-dialog.component';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { KeyDocType } from 'src/app/models/rxdb/schemas/key';
import { RxdbService } from 'src/app/services/rxdb.service';
import { SignerService } from 'src/app/services/signer.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
})
export class ConnectionComponent implements OnInit, OnDestroy {
  // #region Public Properties

  loading = false;
  errorMessage: string | undefined;
  dbConnection: RxDocument<AppDocType> | undefined;
  app: Nip46Uri | undefined;
  logs = new Map<Date, Nip46Log>();

  logNip46Events = true;
  logNostrEvents = true;

  // #endregion Public Properties

  // #region Private Methods

  // #endregion Private Methods

  // #region Init

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _rxdbService: RxdbService,
    private _signerService: SignerService,
    private _matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this._initialize();
  }

  ngOnDestroy(): void {
    this._signerService.nip46Signer?.events.removeAllListeners();
  }

  // #endregion Init

  // #region Public Methods

  keyDescOrder = (
    a: KeyValue<Date, Nip46Log>,
    b: KeyValue<Date, Nip46Log>
  ): number => {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  };

  // #endregion Public Methods

  // #region Private Methods

  private async _initialize() {
    try {
      // Step 1: Get connectionId from params
      const connectionId = this._activatedRoute.snapshot.params['id'];
      if (!connectionId) {
        throw new Error('Could not retrieve connectionId from URL parameter.');
      }

      // Step 2: Get connection data from database.
      this.dbConnection = await this._getConnectionFromDb(connectionId);

      // Step 3: Start the signer.
      this.app = Nip46Uri.fromURI(this.dbConnection.nostrConnectUri);
      await this._signerService.nip46Signer?.goOnline(this.app);

      // Step 4: Subscribe to requests from app.
      this._signerService.nip46Signer?.events.addListener(
        Nip46SignerEvent.IncomingRequest_get_public_key,
        this._handleGetPublicKeyRequest.bind(this)
      );

      this._signerService.nip46Signer?.events.addListener(
        Nip46SignerEvent.IncomingRequest_sign_event,
        this._handleSignEventRequest.bind(this)
      );

      // const nip46Socket = this._signerService.nip46Signer?.getNip46Socket(
      //   this.app
      // );

      // nip46Socket?.events.addListener(
      //   NostrSocketEvent.EVENT,
      //   (event: NostrRelay2ClientMessage_EVENT) => {
      //     this._log(LogLevel.Nostr, 'in', 'Nostr EVENT', event.event);
      //   }
      // );

      // nip46Socket?.events.addListener(
      //   NostrSocketEvent.EOSE,
      //   (event: NostrRelay2ClientMessage_EOSE) => {
      //     this._log(LogLevel.Nostr, 'in', 'Nostr EOSE');
      //   }
      // );

      // nip46Socket?.events.addListener(
      //   NostrSocketEvent.NOTICE,
      //   (event: NostrRelay2ClientMessage_NOTICE) => {
      //     this._log(LogLevel.Nostr, 'in', 'Nostr NOTICE');
      //   }
      // );

      // Step 5: Send "connect" to app. Now it's up to the app to request "things".
      await this._signerService.nip46Signer?.sendConnect(this.app);
      this._log(Nip46LogLevel.Nip46, 'out', 'connect');
    } catch (error) {
      // TODO: Better error message handling.
      this.errorMessage = JSON.stringify(error);
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  private async _getConnectionFromDb(connectionId: string) {
    await this._rxdbService.waitForDb();

    const result = await this._rxdbService.db?.apps
      .findOne({
        selector: {
          id: connectionId,
        },
      })
      .exec();
    if (!result) {
      throw new Error(
        'Could not retrieve connection data from internal database.'
      );
    }
    return result;
  }

  private _log(
    level: Nip46LogLevel,
    direction: 'in' | 'out',
    message: string,
    details?: object
  ) {
    if (level === Nip46LogLevel.Nip46) {
      if (!this.logNip46Events) {
        return;
      }

      this.logs.set(new Date(), new Nip46Log({ direction, message, details }));
    } else if (level === Nip46LogLevel.Nostr) {
      if (!this.logNostrEvents) {
        return;
      }
      this.logs.set(new Date(), new Nip46Log({ direction, message, details }));
    }
  }

  private _handleGetPublicKeyRequest(app: Nip46Uri, requestId: string) {
    this._log(Nip46LogLevel.Nip46, 'in', 'get_public_key');

    if (!this.app) {
      return;
    }

    const data: ApproveGetPublicKeyDialogData = {
      app: this.app,
    };

    const dialog = this._matDialog.open(ApproveGetPublicKeyDialogComponent, {
      data,
      autoFocus: false,
      minWidth: '340px',
      maxWidth: '500px',
    });

    dialog
      .afterClosed()
      .subscribe(
        async ({
          pubkey,
          keyAndDelegation,
        }: {
          pubkey: string | undefined | null;
          keyAndDelegation: KeyAndDelegation | undefined;
        }) => {
          if (this.app && pubkey) {
            this._signerService.nip46Signer?.sendGetPublicKeyResponse(
              this.app,
              requestId,
              pubkey,
              undefined
            );

            let details = '';
            if (typeof keyAndDelegation === 'undefined') {
              details = 'extension';
            } else if (typeof keyAndDelegation.key !== 'undefined') {
              details = keyAndDelegation.key.nick;
            } else if (typeof keyAndDelegation.delegation !== 'undefined') {
              details = keyAndDelegation.delegation.delegatorNick ?? 'na';
            }

            this._log(
              Nip46LogLevel.Nip46,
              'out',
              `get_public_key (${details})`
            );
          } else if (this.app && !pubkey) {
            // Declined. Send respective response.
            this._signerService.nip46Signer?.sendGetPublicKeyResponse(
              this.app,
              requestId,
              null,
              'The user declined your request.'
            );
          }
        }
      );
  }

  private _handleSignEventRequest(
    app: Nip46Uri,
    requestId: string,
    eventTemplate: EventTemplate
  ) {
    this._log(Nip46LogLevel.Nip46, 'in', 'sign_event');

    if (!this.app || this.app !== app) {
      return;
    }

    const data: ApproveSignEventDialogData = {
      app: this.app,
      eventTemplate,
    };

    const dialog = this._matDialog.open(ApproveSignEventDialogComponent, {
      autoFocus: false,
      minWidth: '340px',
      maxWidth: '500px',
      data,
    });

    dialog.afterClosed().subscribe((result: ApproveSignEventDialogResponse) => {
      if (result.signedEvent && this.app) {
        this._signerService.nip46Signer?.sendSignEventResponse(
          this.app,
          requestId,
          result.signedEvent,
          undefined
        );

        let details = '';
        if (typeof result.keyAndDelegation === 'undefined') {
          details = 'extension';
        } else if (typeof result.keyAndDelegation.delegation === 'undefined') {
          details = result.keyAndDelegation.key.nick;
        } else {
          details =
            result.keyAndDelegation.key.nick +
            ' on behalf of ' +
            result.keyAndDelegation.delegatorNick;
        }

        this._log(Nip46LogLevel.Nip46, 'out', `sign_event (${details})`);
      } else if (!result.signedEvent && this.app) {
        // Declined.
        this._signerService.nip46Signer?.sendSignEventResponse(
          this.app,
          requestId,
          null,
          'The user declined your request.'
        );
      }
    });
  }

  // #endregion Private Methods
}
