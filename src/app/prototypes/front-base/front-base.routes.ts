import { Routes } from '@angular/router';

export const FRONT_BASE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./front-base-prototype.component').then(
        (m) => m.FrontBasePrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/front-base-main-screen.component').then(
            (m) => m.FrontBaseMainScreenComponent
          ),
      },
    ],
  },
];
