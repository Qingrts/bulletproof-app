import { Component, OnChanges, Input, Output, EventEmitter, inject } from "@angular/core";
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from "@angular/forms";
import { AppInputComponent } from "@shared/components";
import { User } from "../models/user.model";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzSelectModule } from "ng-zorro-antd/select";

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, AppInputComponent, NzButtonModule, NzSelectModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <app-input 
        label="用户名" 
        formControlName="username" 
        placeholder="请输入用户名">
      </app-input>

      <app-input 
        label="邮箱" 
        formControlName="email" 
        placeholder="请输入邮箱">
      </app-input>

      <div class="form-item">
        <label>角色</label>
        <nz-select formControlName="role">
          <nz-option nzValue="admin" nzLabel="管理员"></nz-option>
          <nz-option nzValue="user" nzLabel="普通用户"></nz-option>
        </nz-select>
      </div>

      <div class="footer">
        <button nz-button (click)="onCancel.emit()">取消</button>
        <button 
          nz-button 
          nzType="primary" 
          [nzLoading]="loading" 
          [disabled]="form.invalid || loading">
          保存
        </button>
      </div>
    </form>
  `
})
export class UserFormComponent implements OnChanges {
  @Input() userData?: User;
  @Input() loading = false;
  @Output() onSave = new EventEmitter<Partial<User>>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(NonNullableFormBuilder);
  
  form = this.fb.group({
    id: [''],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as User['role'], [Validators.required]]
  });

  ngOnChanges() {
    if (this.userData) {
      this.form.patchValue(this.userData);
    }
  }

  submit() {
    if (this.form.valid) {
      this.onSave.emit(this.form.getRawValue());
    }
  }
}