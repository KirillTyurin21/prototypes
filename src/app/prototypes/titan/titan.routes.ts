import { Routes } from '@angular/router';

export const TITAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./titan-prototype.component').then(m => m.TitanPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/titan-main-screen.component').then(m => m.TitanMainScreenComponent),
      },
    ],
  },
];
