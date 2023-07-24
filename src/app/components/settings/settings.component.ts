import { Component } from '@angular/core';
import { ConfirmService } from 'src/app/services/confirm.service';
import { RxdbService } from 'src/app/services/rxdb.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  constructor(
    private _rxdbService: RxdbService,
    private _confirmService: ConfirmService
  ) {}

  resetDb() {
    this._confirmService.open(
      'Please confirm',
      `Do you really want to reset the database? All data will be lost.`,
      async () => {
        this._rxdbService.destroyDb();
      },
      undefined,
      async (ok) => {
        if (ok) {
          location.assign(document.location.origin);
        }
      }
    );
  }
}
