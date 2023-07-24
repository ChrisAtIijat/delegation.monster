import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Nip46Uri } from '@iijat-sw/nip46';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-paste-uri',
  templateUrl: './paste-uri.component.html',
  styleUrls: ['./paste-uri.component.scss'],
})
export class PasteUriComponent {
  // #region Public Properties

  nostrConnectUri: string | undefined;

  // #endregion Public Properties

  constructor(private _bottomSheetRef: MatBottomSheetRef<PasteUriComponent>) {}

  onClickAccept() {
    if (!this.nostrConnectUri) {
      return;
    }

    const app = Nip46Uri.fromURI(this.nostrConnectUri);
    this._bottomSheetRef.dismiss(app);
  }
}
