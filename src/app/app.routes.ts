import { Routes } from '@angular/router';

/**
 * Главные маршруты приложения.
 *
 * Для добавления нового прототипа:
 * 1. Создай папку в src/app/prototypes/<имя>/
 * 2. Создай файл маршрутов (demo.routes.ts)
 * 3. Добавь loadChildren ниже
 * 4. Добавь запись в prototypes.registry.ts
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home.component').then(m => m.HomeComponent),
      },
      // === ПРОТОТИПЫ ===
      {
        path: 'prototype/demo',
        loadChildren: () =>
          import('./prototypes/demo/demo.routes').then(m => m.DEMO_ROUTES),
      },
      {
        path: 'prototype/iikoweb-screens',
        loadChildren: () =>
          import('./prototypes/iikoweb-screens/iikoweb-screens.routes').then(
            m => m.IIKOWEB_SCREENS_ROUTES
          ),
      },
      {
        path: 'prototype/iiko-front-plugins',
        loadChildren: () =>
          import('./prototypes/iiko-front-plugins/iiko-front-plugins.routes').then(
            m => m.IIKO_FRONT_PLUGINS_ROUTES
          ),
      },
      {
        path: 'prototype/pudu-yandex-pay',
        loadChildren: () =>
          import('./prototypes/pudu-yandex-pay/pudu-yandex-pay.routes').then(
            m => m.PUDU_YANDEX_PAY_ROUTES
          ),
      },
      {
        path: 'prototype/iiko-front-pudu-plugin',
        loadChildren: () =>
          import('./prototypes/iiko-front-pudu-plugin/pudu-plugin.routes').then(
            m => m.PUDU_PLUGIN_ROUTES
          ),
      },
      // Добавляй новые прототипы здесь
    ],
  },
];
