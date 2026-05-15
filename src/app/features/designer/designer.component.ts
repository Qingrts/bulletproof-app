import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { CanvasComponent } from "./components/canvas/canvas.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { AssetLibraryComponent } from './components/asset-library/asset-library.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    CanvasComponent,
    SettingsComponent,
    AssetLibraryComponent,
],
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss']
})
export class DesignerComponent {
}