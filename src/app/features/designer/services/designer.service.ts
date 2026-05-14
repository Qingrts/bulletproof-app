import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WidgetConfig {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: any;
  zIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class DesignerService {
  private widgetsSubject = new BehaviorSubject<WidgetConfig[]>([]);
  widgets$ = this.widgetsSubject.asObservable();

  private selectedWidgetIdSubject = new BehaviorSubject<string | null>(null);
  selectedWidgetId$ = this.selectedWidgetIdSubject.asObservable();

  addWidget(type: string, name: string) {
    const newWidget: WidgetConfig = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name,
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      zIndex: this.widgetsSubject.value.length + 1,
      props: {
        title: name,
        theme: 'dark'
      }
    };
    this.widgetsSubject.next([...this.widgetsSubject.value, newWidget]);
    this.selectWidget(newWidget.id);
  }

  updateWidget(id: string, updates: Partial<WidgetConfig>) {
    const updated = this.widgetsSubject.value.map(w => 
      w.id === id ? { ...w, ...updates } : w
    );
    this.widgetsSubject.next(updated);
  }

  selectWidget(id: string | null) {
    this.selectedWidgetIdSubject.next(id);
  }

  getSelectedWidgetId() {
    return this.selectedWidgetIdSubject.value;
  }

  removeWidget(id: string) {
    this.widgetsSubject.next(this.widgetsSubject.value.filter(w => w.id !== id));
    if (this.selectedWidgetIdSubject.value === id) {
      this.selectedWidgetIdSubject.next(null);
    }
  }

  getWidgets() {
    return this.widgetsSubject.value;
  }
}
