import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MixedService {
  readonly isNip07BrowserExtensionAvailable: boolean = false;
  isLightMode = false;

  constructor() {
    // Check, if an NIP-07 browser extension is available.
    if (window.nostr) {
      this.isNip07BrowserExtensionAvailable = true;
    }
  }

  switchToLightMode() {
    this.isLightMode = true;
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = 'rgba(0,0,0,0.87)';
  }

  switchToDarkMode() {
    this.isLightMode = false;
    document.body.style.backgroundColor = '#1c1a38';
    document.body.style.color = '#ffffff';
  }
}
