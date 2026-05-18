import { Routes } from '@angular/router';

export const HALYK_CONSENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./halyk-consent-prototype.component').then(m => m.HalykConsentPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/halyk-main-screen.component').then(m => m.HalykMainScreenComponent),
      },
      {
        path: 'integrations',
        loadComponent: () =>
          import('./screens/integrations-screen.component').then(m => m.IntegrationsScreenComponent),
      },
      {
        path: 'access-requests',
        loadComponent: () =>
          import('./screens/access-requests-screen.component').then(m => m.AccessRequestsScreenComponent),
      },
      {
        path: 'plugin-status',
        loadComponent: () =>
          import('./screens/plugin-status-screen.component').then(m => m.PluginStatusScreenComponent),
      },
    ],
  },
];
