import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommentsFeatureComponent } from './features/comments/comments-feature.component';
import { LoadingService } from './core/services/loading.service';
import { AppStateService } from './core/services/app-state.service';
import { DynamicFormComponent } from './features/dynamic-form/dynamic-form.component';
import { UserListComponent } from "./features/user/user-list.component";
import { UploaderComponent } from "./features/uploader/uploader.component";
import { ProductListComponent } from './features/product/pages/product-list/product-list.component';
import { StorageService } from '@core/storage/storage.service';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommentsFeatureComponent, DynamicFormComponent, UserListComponent, UploaderComponent
    , ProductListComponent, NzButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.less',
})
export class App {
  protected readonly title = signal('bulletproof-app');

  loadingService = inject(LoadingService);
  storageService = inject(StorageService);

  constructor(
    appState: AppStateService, 
    router: Router, 
    // authService: AuthService
  ) {
    appState.unauthorized$.subscribe(() => {
      // authService.logoutLocally();
      router.navigate(['/login'], { queryParams: { returnUrl: router.url }});
    });
  }

  setStorage(t: any) {
    this.storageService.set('d', Math.random());
  }

  getStorage() {
    this.storageService.get('d')
      .then((d: any) => {
        console.log('d', d);
      });
  }
}
