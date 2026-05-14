import { Component, Input, Output, EventEmitter, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [attr.aria-disabled]="disabled || loading"
      [class]="buttonClasses()"
      (click)="buttonClick.emit($event); clicked.emit()"
    >
      @if (loading()) {
        <span class="loading-spinner"></span>
      }
      <span class="btn-content">
        {{ label() }}
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [
    `
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
        position: relative;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-content {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      /* Variants */
      .btn-primary {
        background-color: #2563eb;
        color: white;
      }
      .btn-primary:hover:not(:disabled) {
        background-color: #3b82f6;
      }
      .btn-secondary {
        background-color: #6b7280;
        color: white;
      }
      .btn-secondary:hover:not(:disabled) {
        background-color: #4b5563;
      }

      .btn-danger {
        background-color: #ef4444;
        color: white;
      }
      .btn-danger:hover:not(:disabled) {
        background-color: #dc2626;
      }

      .btn-success {
        background-color: #10b981;
        color: white;
      }
      .btn-success:hover:not(:disabled) {
        background-color: #059669;
      }

      /* Sizes */
      .btn-small {
        padding: 6px 12px;
        font-size: 12px;
      }

      .btn-medium {
        padding: 8px 16px;
        font-size: 14px;
      }

      .btn-large {
        padding: 12px 24px;
        font-size: 16px;
      }

      /* Loading spinner */
      .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('medium');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  label = input<string>('');

  @Output() buttonClick = new EventEmitter<Event>();
  @Output() clicked = new EventEmitter<void>();

  // 使用 computed 代替函数
  buttonClasses = computed(() => {
    return `btn btn-${this.variant()} btn-${this.size()}`;
  });
}
