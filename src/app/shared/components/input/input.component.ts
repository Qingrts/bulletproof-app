import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input'; // 👈 只有这里依赖 Zorro
import { HlmInputImports } from '@spartan-ng/helm/input/src';


@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NzInputModule, ReactiveFormsModule, FormsModule, HlmInputImports],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="app-input-wrapper">
      @if (label) { <label>{{ label }}</label> }
      
      <!-- 💡 这里封装了具体的 UI 实现 -->
      <input 
        nz-input 
        [placeholder]="placeholder" 
        [nzSize]="size"
        [disabled]="disabled"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
      />

      <input hlmInput type="password" placeholder="sk-..." />
    </div>
  `
})
export class AppInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() size: 'large' | 'default' | 'small' = 'default';

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
}