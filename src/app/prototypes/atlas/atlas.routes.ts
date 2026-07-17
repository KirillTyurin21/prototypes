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
          import('./screens/atlas-integration-detail.component').then(
            m => m.AtlasIntegrationDetailComponent,
          ),
      },
      {
        path: ':integrationId/connect',
        loadComponent: () =>
          import('./screens/atlas-connect-wizard.component').then(
            m => m.AtlasConnectWizardComponent,
          ),
      },
    ],
  },
];
