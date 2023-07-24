import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
})
export class ClipComponent {
  @Input() text: string | undefined;
  @Input() icon: string | undefined;
  @Input() isSecret = false;

  isOnCopyToClipboard = false;

  constructor(private _clipboard: Clipboard) {}

  getSecretText(): string {
    let secretText = '';

    for (let i = 0; i < (this.text?.length ?? 0); i++) {
      secretText += '*';
    }

    return secretText;
  }

  onClick() {
    if (!this.text || this.isOnCopyToClipboard) {
      return;
    }

    this.isOnCopyToClipboard = true;

    this._clipboard.copy(this.text);

    window.setTimeout(() => {
      this.isOnCopyToClipboard = false;
    }, 2000);
  }
}
