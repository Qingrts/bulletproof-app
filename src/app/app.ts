import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommentsFeatureComponent } from './features/comments/comments-feature.component';
import { LoadingService } from './core/services/loading.service';
import { AppStateService } from './core/services/app-state.service';
import { DynamicFormComponent } from './features/dynamic-form/dynamic-form.component';
import { UserListComponent } from "./features/user/user-list.component";
import { UploaderComponent } from "./features/uploader/uploader.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommentsFeatureComponent, DynamicFormComponent, UserListComponent, UploaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.less',
})
export class App {
  protected readonly title = signal('bulletproof-app');

  loadingService = inject(LoadingService);

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
}
