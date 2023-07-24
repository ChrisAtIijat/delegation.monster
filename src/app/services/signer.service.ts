import { Injectable } from '@angular/core';
import { Nip46Signer } from '@iijat-sw/nip46';

@Injectable({
  providedIn: 'root',
})
export class SignerService {
  nip46Signer: Nip46Signer | undefined;

  // #region Private Properties

  private _isInitialized = false;

  // #endregion Private Properties

  constructor() {
    //
  }

  initialize(privkey: string) {
    if (this._isInitialized) {
      return;
    }

    this.nip46Signer = new Nip46Signer(privkey);
  }
}
