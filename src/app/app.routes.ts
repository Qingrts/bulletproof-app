import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'post/:id',
    loadComponent: () =>
      import('./features/comments/comments-feature.component').then(
        (m) => m.CommentsFeatureComponent,
      ),
  },
];
