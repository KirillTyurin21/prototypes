import { Routes } from '@angular/router';

export const AURORA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./aurora-prototype.component').then(
        m => m.AuroraPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/aurora-main-screen.component').then(
            m => m.AuroraMainScreenComponent
          ),
      },
      {
        path: 'plugin/payment',
        loadComponent: () =>
          import('./screens/plugin-payment-screen.component').then(
            m => m.PluginPaymentScreenComponent
          ),
      },
      {
        path: 'plugin/refund',
        loadComponent: () =>
          import('./screens/plugin-refund-screen.component').then(
            m => m.PluginRefundScreenComponent
          ),
      },
      {
        path: 'plugin/fiscal-error',
        loadComponent: () =>
          import('./screens/plugin-fiscal-error-screen.component').then(
            m => m.PluginFiscalErrorScreenComponent
          ),
      },
      {
        path: 'plugin/setup',
        loadComponent: () =>
          import('./screens/plugin-setup-screen.component').then(
            m => m.PluginSetupScreenComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./screens/admin-credentials-screen.component').then(
            m => m.AdminCredentialsScreenComponent
          ),
      },
    ],
  },
];
