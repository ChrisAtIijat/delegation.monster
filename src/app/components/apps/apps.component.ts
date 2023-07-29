import { Component, OnInit, OnDestroy } from '@angular/core';
import { RxDocument } from 'rxdb';
import { Subscription } from 'rxjs';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { ConfirmService } from 'src/app/services/confirm.service';
import { RxdbService } from 'src/app/services/rxdb.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
})
export class AppsComponent implements OnInit, OnDestroy {
  apps: RxDocument<AppDocType>[] = [];
  selectedApp: RxDocument<AppDocType> | undefined;
  isOverlayEditAppVisible = false;

  private _appsSubscription: Subscription | undefined;

  constructor(
    private _rxdbService: RxdbService,
    private _confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this._loadApps();
  }

  ngOnDestroy(): void {
    this._appsSubscription?.unsubscribe();
  }

  onClickApp(app: RxDocument<AppDocType>) {
    this.selectedApp = app;
    this.isOverlayEditAppVisible = true;
  }

  private async _loadApps() {
    this._appsSubscription = await this._rxdbService.db?.apps
      .find({
        selector: {},
      })
      .$.subscribe((apps) => {
        this.apps = apps;
      });
  }

  onClickDeleteApp() {
    if (!this.selectedApp) {
      return;
    }

    this._confirmService.open(
      'Please confirm',
      'Do you really want to delete this app?',
      async () => {
        await this.selectedApp?.remove();
        this.isOverlayEditAppVisible = false;
      },
      undefined,
      async () => {
        (document.activeElement as HTMLElement)?.blur();
      }
    );
  }
}
