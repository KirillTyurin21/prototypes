import { Routes } from '@angular/router';

export const EAGLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./eagle-prototype.component').then(m => m.EaglePrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/restaurants-screen.component').then(m => m.RestaurantsScreenComponent),
      },
      {
        path: 'robots',
        loadComponent: () =>
          import('./screens/robots-screen.component').then(m => m.RobotsScreenComponent),
      },
      {
        path: 'mapping',
        loadComponent: () =>
          import('./screens/mapping-screen.component').then(m => m.MappingScreenComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./screens/settings-screen.component').then(m => m.SettingsScreenComponent),
      },
    ],
  },
];
