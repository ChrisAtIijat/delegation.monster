import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../component-dialogs/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  constructor(private _matDialog: MatDialog) {}

  open(
    title: string,
    text: string | undefined,
    ok: () => Promise<any>,
    notOk?: () => Promise<any>,
    afterClosed?: (ok: boolean) => Promise<any>
  ) {
    const data: ConfirmDialogData = {
      title,
      text,
      ok,
      notOk,
    };

    const dialog = this._matDialog.open(ConfirmDialogComponent, {
      data,
      autoFocus: false,
    });

    dialog.afterClosed().subscribe(async (ok: boolean) => {
      if (afterClosed) {
        await afterClosed(ok);
      }
    });
  }
}
