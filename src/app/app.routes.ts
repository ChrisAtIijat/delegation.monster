import { Route } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { ConnectionComponent } from './components/connection/connection.component';
import { KeysComponent } from './components/keys/keys.component';
import { AppsComponent } from './components/apps/apps.component';
import { SettingsComponent } from './components/settings/settings.component';
import { IdsComponent } from './components/ids/ids.component';
import { TosComponent } from './components/tos/tos.component';
import { PpComponent } from './components/pp/pp.component';
import { FaqComponent } from './components/faq/faq.component';
import { DebugComponent } from './components/debug/debug.component';
import { ContactComponent } from './components/contact/contact.component';
import { DelegationsComponent } from './components/delegations/delegations.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LandingComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'ids',
        component: IdsComponent,
      },
      {
        path: 'apps',
        component: AppsComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'app/:id',
        component: ConnectionComponent,
      },
      {
        path: 'faq',
        component: FaqComponent,
      },
      {
        path: 'terms-of-service',
        component: TosComponent,
      },
      {
        path: 'privacy-policy',
        component: PpComponent,
      },
      {
        path: 'nip46-test-app',
        component: DebugComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      {
        path: 'delegations',
        component: DelegationsComponent,
      },
    ],
  },
];
