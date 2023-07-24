import { Component, OnInit } from '@angular/core';
import { RxDocument } from 'rxdb';
import { AppDocType } from 'src/app/models/rxdb/schemas/app';
import { RxdbService } from 'src/app/services/rxdb.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
})
export class AppsComponent implements OnInit {
  apps: RxDocument<AppDocType>[] = [];
  selectedApp: RxDocument<AppDocType> | undefined;

  constructor(private _rxdbService: RxdbService) {}

  ngOnInit(): void {
    this._loadKeys();
  }

  onClickApp(app: RxDocument<AppDocType>) {
    //
  }

  private async _loadKeys() {
    const dbApps = await this._rxdbService.db?.apps
      .find({
        selector: {},
      })
      .exec();

    if (!dbApps) {
      return;
    }

    this.apps = Array.from(dbApps).sort((a, b) => {
      return a.metadata.name.localeCompare(b.metadata.name);
    });
  }
}
