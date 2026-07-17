import { Routes } from '@angular/router';

export const ATLAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./atlas-prototype.component').then(m => m.AtlasPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/atlas-main-screen.component').then(
            m => m.AtlasMainScreenComponent,
          ),
      },
      {
        path: ':integrationId',
        loadComponent: () =>
          import('./screens/atlas-detail-screen.component').then(
            m => m.AtlasDetailScreenComponent,
          ),
      },
    ],
  },
];
