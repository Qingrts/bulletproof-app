import { Component, inject, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollapsibleGroupComponent } from "../collapsible-group/collapsible-group.component";
import { PropertyControlComponent } from '../property-control/property-control.component';
import { DesignerStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-customize-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CollapsibleGroupComponent, PropertyControlComponent],
  templateUrl: `./customize-panel.component.html`,
  styles: [`
    
  `]
})
export class CustomizePanelComponent {

  state = inject(DesignerStateService);

  filterConfig: any = [
    { key: 'hue', label: '色相', min: 0, max: 360, unit: 'deg', input: 'progress' },
    { key: 'saturation', label: '饱和度', min: 0, max: 200, unit: '%', input: 'progress' },
    { key: 'contrast', label: '对比度', min: 0, max: 200, unit: '%', input: 'progress' },
    { key: 'brightness', label: '亮度', min: 0, max: 200, unit: '%', input: 'progress' },
    { key: 'opacity', label: '透明度', min: 0, max: 100, unit: '%', input: 'progress' },
  ];

  refreshCanvas() {

  }
}