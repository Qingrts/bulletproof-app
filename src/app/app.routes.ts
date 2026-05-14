import { Routes } from '@angular/router';

export const routes: Routes = [
  // {
  //   path: 'post/:id',
  //   loadComponent: () =>
  //     import('./features/comments/comments-feature.component').then(
  //       (m) => m.CommentsFeatureComponent,
  //     ),
  // },
  {
    path: 'product',
    loadComponent: () => 
      import('./features/product/pages/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'design',
    loadComponent: () => 
      import('./features/designer/designer.component').then(
        (m) => m.DesignerComponent,
      ),
  },
];
