import { Component } from '@angular/core';
import packageJson from '../../../../package.json';
import { MtxDrawerRef } from '@ng-matero/extensions/drawer';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  constructor(public drawer: MtxDrawerRef<MenuComponent>) {}

  year = new Date().toISOString().slice(0, 4);
  version = packageJson.version;
}
