import { Routes } from '@angular/router';

export const Q4_VISION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./q4-vision-prototype.component').then(
        m => m.Q4VisionPrototypeComponent
      ),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./screens/overview-screen.component').then(
            m => m.OverviewScreenComponent
          ),
      },
      {
        path: 'task-1-1',
        loadComponent: () =>
          import('./screens/task-1-1-content-screen.component').then(
            m => m.Task11ContentScreenComponent
          ),
      },
      {
        path: 'task-1-2',
        loadComponent: () =>
          import('./screens/task-1-2-readiness-screen.component').then(
            m => m.Task12ReadinessScreenComponent
          ),
      },
      {
        path: 'task-2-1',
        loadComponent: () =>
          import('./screens/task-2-1-hints-screen.component').then(
            m => m.Task21HintsScreenComponent
          ),
      },
      {
        path: 'task-2-2',
        loadComponent: () =>
          import('./screens/task-2-2-hints-readiness-screen.component').then(
            m => m.Task22HintsReadinessScreenComponent
          ),
      },
      {
        path: 'task-3-1',
        loadComponent: () =>
          import('./screens/task-3-1-pages-screen.component').then(
            m => m.Task31PagesScreenComponent
          ),
      },
      {
        path: 'task-3-2',
        loadComponent: () =>
          import('./screens/task-3-2-controls-screen.component').then(
            m => m.Task32ControlsScreenComponent
          ),
      },
      {
        path: 'task-3-3',
        loadComponent: () =>
          import('./screens/task-3-3-copy-screen.component').then(
            m => m.Task33CopyScreenComponent
          ),
      },
      {
        path: 'task-4-1',
        loadComponent: () =>
          import('./screens/task-4-1-tags-screen.component').then(
            m => m.Task41TagsScreenComponent
          ),
      },
      {
        path: 'task-4-2',
        loadComponent: () =>
          import('./screens/task-4-2-colors-screen.component').then(
            m => m.Task42ColorsScreenComponent
          ),
      },
      {
        path: 'task-5',
        loadComponent: () =>
          import('./screens/task-5-matomo-screen.component').then(
            m => m.Task5MatomoScreenComponent
          ),
      },
      {
        path: 'task-6',
        loadComponent: () =>
          import('./screens/task-6-home-screen.component').then(
            m => m.Task6HomeScreenComponent
          ),
      },
    ],
  },
];
