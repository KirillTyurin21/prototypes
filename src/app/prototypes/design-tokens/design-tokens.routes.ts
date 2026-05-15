import { Routes } from '@angular/router';

export const DESIGN_TOKENS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./design-tokens-prototype.component').then(m => m.DesignTokensPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/design-tokens-main-screen.component').then(
            m => m.DesignTokensMainScreenComponent,
          ),
      },
      {
        path: 'colors',
        loadComponent: () =>
          import('./screens/dt-colors-screen.component').then(
            m => m.DtColorsScreenComponent,
          ),
      },
      {
        path: 'typography',
        loadComponent: () =>
          import('./screens/dt-typography-screen.component').then(
            m => m.DtTypographyScreenComponent,
          ),
      },
      {
        path: 'spacing',
        loadComponent: () =>
          import('./screens/dt-spacing-screen.component').then(
            m => m.DtSpacingScreenComponent,
          ),
      },
      {
        path: 'components',
        loadComponent: () =>
          import('./screens/dt-components-screen.component').then(
            m => m.DtComponentsScreenComponent,
          ),
      },
    ],
  },
];
