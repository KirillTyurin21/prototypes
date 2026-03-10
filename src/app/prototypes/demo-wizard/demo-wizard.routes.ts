import { Routes } from '@angular/router';

export const DEMO_WIZARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./demo-wizard-prototype.component').then(m => m.DemoWizardPrototypeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/wizard-select-screen.component').then(m => m.WizardSelectScreenComponent),
      },
      {
        path: 'approach-a',
        loadComponent: () =>
          import('./approach-a/approach-a-screen.component').then(m => m.ApproachAScreenComponent),
      },
      {
        path: 'approach-b',
        loadComponent: () =>
          import('./approach-b/approach-b-screen.component').then(m => m.ApproachBScreenComponent),
      },
      {
        path: 'approach-c',
        loadComponent: () =>
          import('./approach-c/approach-c-screen.component').then(m => m.ApproachCScreenComponent),
      },
      {
        path: 'approach-d',
        loadComponent: () =>
          import('./approach-d/approach-d-screen.component').then(m => m.ApproachDScreenComponent),
      },
    ],
  },
];
