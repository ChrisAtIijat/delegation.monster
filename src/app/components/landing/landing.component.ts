import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FirstTimeRunDialogComponent } from 'src/app/component-dialogs/first-time-run-dialog/first-time-run-dialog.component';
import { RequestUnlockCodeDialogComponent } from 'src/app/component-dialogs/request-unlock-code-dialog/request-unlock-code-dialog.component';
import { KeyDocTypeUsage } from 'src/app/models/rxdb/schemas/key';
import { RxdbService, RxdbServiceState } from 'src/app/services/rxdb.service';
import { SignerService } from 'src/app/services/signer.service';
import packageJson from '../../../../package.json';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit, OnDestroy {
  version = packageJson.version;
  errorMessage: string | undefined;

  private _rxdbServiceSubscription: Subscription | undefined;
  private _rxdbServiceErrorSubscription: Subscription | undefined;

  constructor(
    public rxdbService: RxdbService,
    private _signerService: SignerService,
    private _matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to events from the database service to detect
    // whether it needs an unlock code or it is running for the
    // very first time.
    this._rxdbServiceSubscription = this.rxdbService.startupOutEvents.subscribe(
      (event) => {
        if (event === RxdbServiceState.FirstTimeDbRun) {
          this._firstTimeDbRun();
        } else if (event === RxdbServiceState.DbStartUpRequestUnlockCode) {
          this._dbRequestsUnlockCode();
        }
      }
    );

    // Subscribe to error events from the database service.
    this._rxdbServiceErrorSubscription =
      this.rxdbService.errorOutEvent.subscribe((error: string) => {
        this.errorMessage = error;
      });

    // Get the privkey of the signer from the database and start
    // the signer service.
    this.rxdbService.initDb().then(async () => {
      const dbKey = await this.rxdbService.db?.keys
        .findOne({
          selector: {
            usage: KeyDocTypeUsage.Signer,
          },
        })
        .exec();

      if (!dbKey) {
        // TODO
      } else {
        this._signerService.initialize(dbKey.privkey);
      }
    });
  }

  ngOnDestroy(): void {
    this._rxdbServiceSubscription?.unsubscribe();
    this._rxdbServiceErrorSubscription?.unsubscribe();
  }

  resetDb() {
    this.rxdbService.destroyDb();
  }

  private _firstTimeDbRun() {
    // Open the "First Run" dialog.
    const dialog = this._matDialog.open(FirstTimeRunDialogComponent, {
      maxWidth: '400px',
    });

    dialog.afterClosed().subscribe((unlockCode: string) => {
      // Notify the database service about the unlockCode of the user.
      this.rxdbService.unlockCodeEvents.next(unlockCode);
    });
  }

  private _dbRequestsUnlockCode() {
    // Open the "Unlock to continue" dialog.
    const dialog = this._matDialog.open(RequestUnlockCodeDialogComponent, {
      maxWidth: '672px',
    });

    dialog.afterClosed().subscribe((unlockCode: string) => {
      // Notify the database service about the unlockCode of the user.
      this.rxdbService.unlockCodeEvents.next(unlockCode);
    });
  }
}
