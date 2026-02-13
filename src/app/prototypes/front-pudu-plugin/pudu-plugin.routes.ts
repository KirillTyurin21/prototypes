import { Routes } from '@angular/router';

export const PUDU_PLUGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pudu-plugin-prototype.component').then(
        m => m.PuduPluginPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/pudu-catalog-screen.component').then(
            m => m.PuduCatalogScreenComponent
          ),
      },
      {
        path: 'pos',
        loadComponent: () =>
          import('./screens/pudu-pos-screen.component').then(
            m => m.PuduPosScreenComponent
          ),
      },
    ],
  },
];
