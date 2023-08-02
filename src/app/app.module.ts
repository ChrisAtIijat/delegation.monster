import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MtxDatetimepickerModule } from '@ng-matero/extensions/datetimepicker';
import { MtxDrawerModule } from '@ng-matero/extensions/drawer';
import { MtxPopoverModule } from '@ng-matero/extensions/popover';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';

import { addRxPlugin } from 'rxdb';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './component-helpers/header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConnectionComponent } from './components/connection/connection.component';
import { AddConnectionDialogComponent } from './component-dialogs/add-connection-dialog/add-connection-dialog.component';
import { MenuComponent } from './component-helpers/menu/menu.component';
import { KeysComponent } from './components/keys/keys.component';
import { AppsComponent } from './components/apps/apps.component';
import { SettingsComponent } from './components/settings/settings.component';
import { IdsComponent } from './components/ids/ids.component';
import { ScanComponent } from './component-helpers/scan/scan.component';
import { SectionComponent } from './component-helpers/section/section.component';
import { ApproveGetPublicKeyDialogComponent } from './component-dialogs/approve-dialog/approve-get-public-key-dialog.component';
import { CardComponent } from './component-helpers/card/card.component';
import { FirstTimeRunDialogComponent } from './component-dialogs/first-time-run-dialog/first-time-run-dialog.component';
import { RequestUnlockCodeDialogComponent } from './component-dialogs/request-unlock-code-dialog/request-unlock-code-dialog.component';
import { ApproveSignEventDialogComponent } from './component-dialogs/approve-sign-event-dialog/approve-sign-event-dialog.component';
import { PasteKeyComponent } from './component-helpers/paste-key/paste-key.component';
import { TosComponent } from './components/tos/tos.component';
import { PpComponent } from './components/pp/pp.component';
import { FaqComponent } from './components/faq/faq.component';
import { ClipComponent } from './component-helpers/clip/clip.component';
import { ConfirmDialogComponent } from './component-dialogs/confirm-dialog/confirm-dialog.component';
import { DebugComponent } from './components/debug/debug.component';
import { ContactComponent } from './components/contact/contact.component';
import { PasteUriComponent } from './component-helpers/paste-uri/paste-uri.component';
import { DelegationsComponent } from './components/delegations/delegations.component';
import { MatNativeDateModule } from '@angular/material/core';

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBDevModePlugin);

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HomeComponent,
    HeaderComponent,
    ConnectionComponent,
    PasteUriComponent,
    AddConnectionDialogComponent,
    MenuComponent,
    KeysComponent,
    AppsComponent,
    SettingsComponent,
    IdsComponent,
    ScanComponent,
    SectionComponent,
    ApproveGetPublicKeyDialogComponent,
    CardComponent,
    FirstTimeRunDialogComponent,
    RequestUnlockCodeDialogComponent,
    ApproveSignEventDialogComponent,
    PasteKeyComponent,
    TosComponent,
    PpComponent,
    FaqComponent,
    ClipComponent,
    ConfirmDialogComponent,
    DebugComponent,
    ContactComponent,
    DelegationsComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    ReactiveFormsModule,

    MatBottomSheetModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,

    MtxDatetimepickerModule,
    MtxDrawerModule,
    MtxPopoverModule,
    QRCodeModule,
    NgxScannerQrcodeModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
