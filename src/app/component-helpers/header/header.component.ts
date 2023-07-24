import { Component } from '@angular/core';
import { MtxDrawer } from '@ng-matero/extensions/drawer';
import { MenuComponent } from '../menu/menu.component';
import { Router } from '@angular/router';
import { MixedService } from 'src/app/services/mixed.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private _drawer: MtxDrawer,
    private _router: Router,
    public mixedService: MixedService
  ) {}

  onClickMenu(event: MouseEvent) {
    const drawer = this._drawer.open(MenuComponent, {
      position: 'right',
      height: '100%',
      width: '300px',
      hasBackdrop: true,
      closeOnNavigation: true,
    });

    drawer.afterDismissed().subscribe(() => {
      (document.activeElement as HTMLElement)?.blur();
    });
  }

  onClickBrand() {
    this._router.navigateByUrl('/home');
  }
}
