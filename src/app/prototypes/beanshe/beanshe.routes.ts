import { Routes } from '@angular/router';

export const BEANSHE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./beanshe-prototype.component').then(m => m.BeanshePrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/beanshe-main-screen.component').then(
            m => m.BeansheMainScreenComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./screens/beanshe-orders-screen.component').then(
            m => m.BeansheOrdersScreenComponent,
          ),
      },
      {
        path: 'notification-demo',
        loadComponent: () =>
          import('./screens/beanshe-notification-demo-screen.component').then(
            m => m.BeansheNotificationDemoScreenComponent,
          ),
      },
    ],
  },
];
