import { Directive, input, HostBinding } from "@angular/core";

@Directive({
  selector: '[appVisualEffect]',
  standalone: true
})
export class VisualEffectDirective {
  config = input<any>();

  @HostBinding('style.filter') get filter() {
    const c = this.config();
    return c?.blur ? `blur(${c.blur}px)` : 'none';
  }

  @HostBinding('style.opacity') get opacity() {
    return this.config()?.opacity ?? 1;
  }
  
  @HostBinding('style.transform') get transform() {
    return `rotate(${this.config()?.rotation ?? 0}deg)`;
  }
}