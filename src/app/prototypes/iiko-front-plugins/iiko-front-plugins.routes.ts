import { Routes } from '@angular/router';

export const IIKO_FRONT_PLUGINS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./iiko-front-plugins-prototype.component').then(
        m => m.IikoFrontPluginsPrototypeComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/plugins-main-screen.component').then(
            m => m.PluginsMainScreenComponent
          ),
      },
      {
        path: ':pluginId',
        loadComponent: () =>
          import('./screens/plugin-dialogs-screen.component').then(
            m => m.PluginDialogsScreenComponent
          ),
      },
    ],
  },
];
