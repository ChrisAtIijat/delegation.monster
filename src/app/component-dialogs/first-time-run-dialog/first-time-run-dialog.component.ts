import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LOCAL_STORAGE } from 'src/app/models/localStorage';
import { v4 } from 'uuid';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-first-time-run-dialog',
  templateUrl: './first-time-run-dialog.component.html',
  styleUrls: ['./first-time-run-dialog.component.scss'],
})
export class FirstTimeRunDialogComponent {
  unlockCode: string | undefined;
  unlockCodeConfirmed: string | undefined;
  justTestTheSoftware = false;

  get canContinue(): boolean {
    return (
      this.justTestTheSoftware === true ||
      (!!this.unlockCode &&
        this.unlockCode === this.unlockCodeConfirmed &&
        this.unlockCode.length >= 8)
    );
  }

  constructor(private _dialogRef: MatDialogRef<FirstTimeRunDialogComponent>) {}

  continue() {
    if (!this.canContinue) {
      return;
    }

    if (this.justTestTheSoftware) {
      // Generate an unlock passcode, store it in localStorage and close the dialog with it.
      const code = v4();
      localStorage.setItem(LOCAL_STORAGE.DB_TEST_PASSWORD, code);
      this._dialogRef.close(code);
      return;
    }

    // Just close the dialog with the unlock passcode that the user has chosen.
    this._dialogRef.close(this.unlockCode);
  }
}
