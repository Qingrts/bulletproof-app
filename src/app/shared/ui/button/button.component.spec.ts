import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render button element', () => {
    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement).toBeTruthy();
  });

  it('should apply primary variant by default', () => {
    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement.classes['btn-primary']).toBe(true);
  });

  it('should apply correct variant class', () => {
    component.variant = 'danger';
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement.classes['btn-danger']).toBe(true);
  });

  it('should apply correct size class', () => {
    component.size = 'large';
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement.classes['btn-large']).toBe(true);
  });

  it('should be disabled when disabled input is true', () => {
    component.disabled = true;
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement.nativeElement.disabled).toBe(true);
  });

  it('should show loading spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('.loading-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should emit onClick event when clicked', () => {
    const clickSpy = vi.fn();
    component.onClick.subscribe(clickSpy);

    const buttonElement = fixture.debugElement.query(By.css('button'));
    buttonElement.triggerEventHandler('click', new Event('click'));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should emit clicked event when clicked', () => {
    const clickedSpy = vi.fn();
    component.clicked.subscribe(clickedSpy);

    const buttonElement = fixture.debugElement.query(By.css('button'));
    buttonElement.nativeElement.click();

    expect(clickedSpy).toHaveBeenCalled();
  });

  it('should not emit events when disabled', () => {
    component.disabled = true;
    const clickedSpy = vi.fn();
    component.clicked.subscribe(clickedSpy);

    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('button'));
    buttonElement.nativeElement.click();

    expect(clickedSpy).not.toHaveBeenCalled();
  });

  it('should not emit events when loading', () => {
    component.loading = true;
    const clickedSpy = vi.fn();
    component.clicked.subscribe(clickedSpy);

    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('button'));
    buttonElement.nativeElement.click();

    expect(clickedSpy).not.toHaveBeenCalled();
  });

  it('should display content inside button', () => {
    const testContent = 'Click Me';
    component.content = testContent;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement.nativeElement.textContent).toContain(testContent);
  });
});
