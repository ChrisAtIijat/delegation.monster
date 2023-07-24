import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Nip46Uri } from '@iijat-sw/nip46';

export type AddConnectionDialogData = {
  app: Nip46Uri;
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-add-connection-dialog',
  templateUrl: './add-connection-dialog.component.html',
  styleUrls: ['./add-connection-dialog.component.scss'],
})
export class AddConnectionDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddConnectionDialogData,
    private _dialogRef: MatDialogRef<AddConnectionDialogComponent>
  ) {}

  onClickApprove() {
    this._dialogRef.close(true);
  }
}
