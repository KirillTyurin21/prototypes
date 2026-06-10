import { Routes } from '@angular/router';

export const WEB_SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./web-settings-prototype.component').then(
        m => m.WebSettingsPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/permissions-screen.component').then(
            m => m.PermissionsScreenComponent
          ),
      },
    ],
  },
];
