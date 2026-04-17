import { Routes } from '@angular/router';

export const WEB_SCREENS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./web-screens-prototype.component').then(
        m => m.WebScreensPrototypeComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'displays',
        pathMatch: 'full',
      },
      {
        path: 'displays',
        loadComponent: () =>
          import('./screens/displays-screen.component').then(
            m => m.DisplaysScreenComponent
          ),
      },
      {
        path: 'themes-cs',
        loadComponent: () =>
          import('./screens/themes-cs-screen.component').then(
            m => m.ThemesCsScreenComponent
          ),
      },
      {
        path: 'controls',
        loadComponent: () =>
          import('./screens/controls-screen.component').then(
            m => m.ControlsScreenComponent
          ),
      },
      {
        path: 'hints',
        loadComponent: () =>
          import('./screens/hints-screen.component').then(
            m => m.HintsScreenComponent
          ),
      },
      {
        path: 'cs-terminals',
        loadComponent: () =>
          import('./screens/cs-terminals-screen.component').then(
            m => m.CsTerminalsScreenComponent
          ),
      },
      {
        path: 'terminals',
        loadComponent: () =>
          import('./screens/terminals-screen.component').then(
            m => m.TerminalsScreenComponent
          ),
      },
      {
        path: 'themes-arrivals',
        loadComponent: () =>
          import('./screens/themes-arrivals-screen.component').then(
            m => m.ThemesArrivalsScreenComponent
          ),
      },
      {
        path: 'arrivals-theme-editor/:id',
        loadComponent: () =>
          import('./screens/arrivals-theme-editor-screen.component').then(
            m => m.ArrivalsThemeEditorScreenComponent
          ),
      },
      {
        path: 'theme-editor/:id',
        loadComponent: () =>
          import('./screens/theme-editor-screen.component').then(
            m => m.ThemeEditorScreenComponent
          ),
      },
      {
        path: 'arrivals-controls',
        loadComponent: () =>
          import('./screens/stub-screen.component').then(
            m => m.StubScreenComponent
          ),
      },
      {
        path: 'sounds',
        loadComponent: () =>
          import('./screens/stub-screen.component').then(
            m => m.StubScreenComponent
          ),
      },
      {
        path: 'global-hints',
        loadComponent: () =>
          import('./screens/stub-screen.component').then(
            m => m.StubScreenComponent
          ),
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./screens/stub-screen.component').then(
            m => m.StubScreenComponent
          ),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./screens/stub-screen.component').then(
            m => m.StubScreenComponent
          ),
      },
    ],
  },
];
