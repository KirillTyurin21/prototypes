import { Routes } from '@angular/router';

export const DEMO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./demo-prototype.component').then(m => m.DemoPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/demo-main-screen.component').then(m => m.DemoMainScreenComponent),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./screens/demo-list-screen.component').then(m => m.DemoListScreenComponent),
      },
      {
        path: 'form',
        loadComponent: () =>
          import('./screens/demo-form-screen.component').then(m => m.DemoFormScreenComponent),
      },
    ],
  },
];
