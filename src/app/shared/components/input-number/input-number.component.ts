import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'; // 👈 只有这里依赖 Zorro
import { HlmInputImports } from '@spartan-ng/helm/input/src';
import { NzIconModule } from 'ng-zorro-antd/icon';


@Component({
  selector: 'app-input-number',
  standalone: true,
  imports: [NzInputNumberModule, ReactiveFormsModule, FormsModule, NzIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputNumberComponent),
      multi: true
    }
  ],
  template: `
    <div class="app-input-wrapper">
      
      
      <!-- 💡 这里封装了具体的 UI 实现 -->
      
      <div class="input-number-wrapper">
        @if (label) { <label>{{ label }}</label> }
        <nz-input-number [nzPlaceHolder]="placeholder"  [(ngModel)]="value" (ngModelChange)="onValueChange($event)" nzMin="1" nzMax="10" />
        <nz-icon nzType="plus" nzTheme="outline" (click)="onPlus()" />
        <nz-icon class="ml-2 mr-2" nzType="minus" nzTheme="outline" (click)="onMinus()" />
      </div>
    </div>
  `,
  styleUrls: ['./input-number.component.scss']
})
export class AppInputNumberComponent implements ControlValueAccessor {
  @Input() label: string | undefined = '';
  @Input() placeholder = '';
  @Input() size: 'large' | 'default' | 'small' = 'default';
  @Input() maxLength: number | null | undefined = null;

  value: any;
  disabled = false;

  // ControlValueAccessor 的标准实现逻辑...
  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(val: any): void { this.value = val; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onValueChange(val: any) {
    this.onChange(val);
  }

  onPlus() {
    console.log('this.value', this.value);
    this.value = (this.value || 0) + 1;
  }
  onMinus() {
    this.value = (this.value || 0) - 1;
  }
}