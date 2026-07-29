import { Routes } from '@angular/router';

export const PHOENIX_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./phoenix-prototype.component').then(m => m.PhoenixPrototypeComponent),
  },
];
