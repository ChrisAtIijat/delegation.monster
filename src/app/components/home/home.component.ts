import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RxdbService } from 'src/app/services/rxdb.service';
import { Router } from '@angular/router';
import { v4 } from 'uuid';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Nip46Uri } from '@iijat-sw/nip46';
import { MatDialog } from '@angular/material/dialog';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { PasteUriComponent } from 'src/app/component-helpers/paste-uri/paste-uri.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  // #region Public Properties

  nostrConnectString = new FormControl<string | null>(null);
  showScanFs = false;
  showApproveAppFs = false;
  app: Nip46Uri | undefined;

  // #endregion Public Properties

  // #region Init

  constructor(
    private _rxdbService: RxdbService,
    private _router: Router,
    private _bottomSheet: MatBottomSheet,
    private _matDialog: MatDialog
  ) {}

  // #endregion Init

  // #region Public Methods

  onNewApp(app: Nip46Uri) {
    this.app = app;
    this.showApproveAppFs = true;
  }

  onClickPaste() {
    const sheet = this._bottomSheet.open(PasteUriComponent, {
      autoFocus: true,
    });
    sheet.afterDismissed().subscribe((app) => {
      (document.activeElement as HTMLElement)?.blur();

      if (typeof (app as Nip46Uri) === 'undefined') {
        return;
      }

      this.app = app;
      this.showApproveAppFs = true;
    });
  }

  declineApp() {
    this.showApproveAppFs = false;
    window.setTimeout(() => {
      this.app = undefined;
    }, 200);
  }

  approveApp() {
    this.showApproveAppFs = false;
    if (!this.app) {
      return;
    }
    this._handleNewApp(this.app);
  }

  // #endregion Public Methods

  // #region Private Methods

  private async _handleNewApp(app: Nip46Uri) {
    // Check if the connection already exists in the local database.
    // Only use the name of the app in the search. This is by design.
    let dbApp = await this._rxdbService.db?.apps
      .findOne({
        selector: {
          'metadata.name': app.metadata.name,
        },
      })
      .exec();

    if (!dbApp) {
      // This is a new app. Create a database record for it.
      const appData: AppDocType = {
        id: v4(),
        nostrConnectUri: app.toURI(),
        pubkey: app.pubkey,
        relay: app.relay,
        metadata: {
          name: app.metadata.name,
        },
      };

      if (typeof app.metadata.url !== 'undefined') {
        appData.metadata.url = app.metadata.url;
      }

      if (typeof app.metadata.description !== 'undefined') {
        appData.metadata.description = app.metadata.description;
      }

      if (typeof app.metadata.icons !== 'undefined') {
        appData.metadata.icons = app.metadata.icons;
      }

      dbApp = await this._rxdbService.db?.apps.insert(appData);
    } else {
      // The app already exists in the local database. Just update any value
      // that has changed (e.g. pubkey, relay, ...);

      const appUpdateData: any = {};

      if (dbApp.nostrConnectUri !== app.toURI()) {
        appUpdateData.nostrConnectUri = app.toURI();
      }

      if (dbApp.pubkey !== app.pubkey) {
        appUpdateData.pubkey = app.pubkey;
      }

      if (dbApp.relay !== app.relay) {
        appUpdateData.relay = app.relay;
      }

      if (dbApp.metadata.url !== app.metadata.url) {
        if (typeof appUpdateData.metadata === 'undefined') {
          appUpdateData.metadata = { name: app.metadata.name };
        }
        appUpdateData.metadata.url = app.metadata.url;
      }

      if (dbApp.metadata.icons !== app.metadata.icons) {
        if (typeof appUpdateData.metadata === 'undefined') {
          appUpdateData.metadata = { name: app.metadata.name };
        }
        appUpdateData.metadata.icons = app.metadata.icons;
      }

      if (dbApp.metadata.description !== app.metadata.description) {
        if (typeof appUpdateData.metadata === 'undefined') {
          appUpdateData.metadata = { name: app.metadata.name };
        }
        appUpdateData.metadata.description = app.metadata.description;
      }

      if (Object.keys(appUpdateData).length > 0) {
        dbApp = await dbApp.update({
          $set: appUpdateData,
        });
      }
    }

    this._router.navigateByUrl(`/app/${dbApp?.id}`);
  }

  // #endregion Private Methods
}
