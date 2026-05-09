// features/comments/services/comment.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, retry, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './models/user.model';
import { ApiBaseService } from '../../core/services/api/api-base.service';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class UserService extends ApiBaseService {
  private readonly apiUrl = '/api/users';

  create(user: Partial<User>): Observable<User> {
    return this.post<User>(`${this.apiUrl}`, user).pipe(map(res => res.data));
  }
  
  update(userId: string, user: Partial<User>): Observable<User> {
    return this.put<User>(this.getUrl(userId), user).pipe(map(res => res.data));
  }

  getAll() {
    return this.get<User[]>(`${this.apiUrl}`, {}).pipe(map(res => res.data));
  }

  getUrl(suffix: string) {
    return `${this.apiUrl}${suffix}`;
  }
}
