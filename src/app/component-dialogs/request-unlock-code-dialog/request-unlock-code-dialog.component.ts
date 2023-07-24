import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-request-unlock-code-dialog',
  templateUrl: './request-unlock-code-dialog.component.html',
  styleUrls: ['./request-unlock-code-dialog.component.scss'],
})
export class RequestUnlockCodeDialogComponent {
  unlockCode: string | undefined;

  get canUnlock(): boolean {
    return (this.unlockCode?.length ?? 0) >= 8;
  }

  constructor(
    private _dialogRef: MatDialogRef<RequestUnlockCodeDialogComponent>
  ) {}

  unlock() {
    if (!this.canUnlock) {
      return;
    }

    this._dialogRef.close(this.unlockCode);
  }
}
