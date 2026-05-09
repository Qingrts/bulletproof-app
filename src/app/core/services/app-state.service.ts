import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // 使用 Signal 或 Subject 发出身份失效的信号
  readonly unauthorized$ = new Subject<void>();

  notifyUnauthorized() {
    this.unauthorized$.next();
  }
}