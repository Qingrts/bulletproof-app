import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [class]="['card--' + variant, 'card--' + size, { 'card--clickable': clickable }]"
      [style.width]="width"
      (click)="onClick()"
      (keyup.enter)="onClick()"
      [attr.tabindex]="clickable ? 0 : null"
      [attr.role]="clickable ? 'button' : null"
    >
      @if (header) {
        <div class="card__header">
          @if (title) {
            <h3 class="card__title">{{ title }}</h3>
          }
          @if (subtitle) {
            <div class="card__subtitle">{{ subtitle }}</div>
          }
        </div>
      }

      <div class="card__content">
        <ng-content></ng-content>
      </div>

      @if (footer) {
        <div class="card__footer">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        background: white;
      }

      .card--default {
        border: 1px solid #e0e0e0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .card--outlined {
        border: 2px solid #e0e0e0;
        background: transparent;
      }

      .card--elevated {
        border: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .card--elevated:hover {
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .card--clickable {
        cursor: pointer;
      }

      .card--clickable:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .card--small {
        max-width: 300px;
      }

      .card--medium {
        max-width: 400px;
      }

      .card--large {
        max-width: 600px;
      }

      .card__header {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .card__title {
        margin: 0 0 0.25rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .card__subtitle {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .card__content {
        padding: 1rem;
      }

      .card__footer {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }
    `,
  ],
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() variant: CardVariant = 'default';
  @Input() size: CardSize = 'medium';
  @Input() width?: string;
  @Input() clickable = false;
  @Input() header = true;
  @Input() footer = false;

  @Output() cardClick = new EventEmitter<void>();

  onClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }
}
