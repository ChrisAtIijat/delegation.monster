import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ConfirmDialogData = {
  title: string;
  text?: string;
  ok: () => any;
  notOk?: () => any;
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private _dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  async onClickOk() {
    await this.data.ok();
    this._dialogRef.close(true);
  }

  async onClickNotOk() {
    if (this.data.notOk) {
      await this.data.notOk();
    }
    this._dialogRef.close(false);
  }
}
