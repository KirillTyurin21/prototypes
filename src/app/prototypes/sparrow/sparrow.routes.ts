import { Routes } from '@angular/router';

export const SPARROW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sparrow-prototype.component').then(
        (m) => m.SparrowPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/sparrow-main-screen.component').then(
            (m) => m.SparrowMainScreenComponent
          ),
      },
    ],
  },
];
