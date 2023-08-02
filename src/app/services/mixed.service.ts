import { Injectable } from '@angular/core';
import { Kind } from 'nostr-tools';

@Injectable({
  providedIn: 'root',
})
export class MixedService {
  readonly isNip07BrowserExtensionAvailable: boolean = false;
  isLightMode = false;

  private _nostrKindMap: Map<number, string> | undefined;

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

  get nostrKindMap(): Map<number, string> {
    if (typeof this._nostrKindMap !== 'undefined') {
      return this._nostrKindMap;
    }

    this._nostrKindMap = new Map<number, string>([
      [0, 'Metadata'],
      [1, 'Short Text Note'],
      [2, 'Recommend Relay'],
      [3, 'Contacts'],
      [4, 'Encrypted Direct Messages'],
      [5, 'Event Deletion'],
      [6, 'Repost'],
      [7, 'Reaction'],
      [8, 'Badge Award'],
      [16, 'Generic Repost'],
      [40, 'Channel Creation'],
      [41, 'Channel Metadata'],
      [42, 'Channel Message'],
      [43, 'Channel Hide Message'],
      [44, 'Channel Mute User'],
    ]);
    return this._nostrKindMap;
  }
}
