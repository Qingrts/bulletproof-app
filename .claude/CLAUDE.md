# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` or `ng serve` - Start development server on http://localhost:4200
- `npm run build` or `ng build` - Build production application
- `npm run watch` - Build in watch mode for development
- `npm run test` or `ng test` - Run unit tests with Vitest
- `npm run storybook` - Start Storybook dev server on http://localhost:6006
- `npm run build-storybook` - Build static Storybook output

## Architecture Overview

### Feature-Based Structure
All feature code lives under `src/app/features/`. Each feature is self-contained with its own:
- Components
- Models (interfaces, types)
- Services (HTTP clients)
- Store (signal-based state management)
- Supporting files

Example: `features/comments/`

### State Management Pattern
Use signals for local state, computed for derived values, and dedicated store classes for application state:

- **Private signals** for state (wrapped with `asReadonly()` for public API)
- **Computed** for derived values (always pure)
- **Actions** mutate state using `update()` or `set()` (never direct mutation)

Example in `features/comments/store/comment.store.ts`:
```typescript
private commentsSignal = signal<Comment[]>([]);
readonly sortedComments = computed(() => [...this.commentsSignal()].sort(...));
```

### HTTP Service Pattern
Services extend `provideHttpClient()` with retry/timeout logic via RxJS operators:

```typescript
getCommentsByPost(postId: string): Observable<Comment[]> {
  return this.http.get<Comment[]>(`${this.apiUrl}?postId=${postId}`)
    .pipe(timeout(REQUEST_TIMEOUT), retry(MAX_RETRIES));
}
```

### Route Configuration
Routes use lazy loading with dynamic imports:
```typescript
{ path: 'post/:id', loadComponent: () =>
  import('./features/comments/comments-feature.component')
    .then(m => m.CommentsFeatureComponent)
}
```

### Path Aliases
TypeScript paths configured in `tsconfig.app.json`:
- `@components/*` → `src/app/components/*`
- `@pages/*` → `src/app/pages/*`
- `@shared/*` → `src/app/shared/*`

## Key Patterns

### Component Design
- Use `input()` function instead of `@Input()` decorator
- Use `output()` function instead of `@Output()` decorator
- Set `changeDetection: ChangeDetectionStrategy.OnPush`
- Prefer inline templates for small components
- Use `inject()` for dependency injection (no constructor injection)
- Use native control flow (`@if`, `@for`) over directives (`*ngIf`, `*ngFor`)

### Styling
- Use LESS as the styling language
- Use inline styles in component files for simplicity
- Use `class` bindings instead of `ngClass`
- Use `style` bindings instead of `ngStyle`

### Testing
- Vitest with jsdom environment for unit tests
- Test providers in `src/test-providers.ts`
- Vitest config in `vitest.config.ts` and `vitest-base.config.ts`
- Coverage configuration in `vitest.config.ts` excludes test files

### Accessibility
- Always include `role` attributes for interactive elements
- Use `aria-label` for screen readers
- Maintain WCAG AA color contrast
- Ensure proper focus management
