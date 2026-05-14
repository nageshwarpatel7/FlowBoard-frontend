import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notifications`;

  private _unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this._unreadCount.asObservable();

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.base).pipe(
      map(notifications => notifications.map(n => this.normalizeNotification(n))),
      tap(notifications => this._unreadCount.next(notifications.filter(n => !n.isRead).length))
    );
  }

  // Legacy alias for getNotifications
  getAll(): Observable<Notification[]> {
    return this.getNotifications();
  }

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/unread`).pipe(
      map(notifications => notifications.map(n => this.normalizeNotification(n))),
      tap(notifications => this._unreadCount.next(notifications.length))
    );
  }

  refreshUnreadCount(): void {
    this.http.get<number>(`${this.base}/unread/count`).subscribe({
      next: c => this._unreadCount.next(c),
      error: () => {}
    });
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(
      `${this.base}/${id}/read`, {}
    ).pipe(
      map(notification => this.normalizeNotification(notification)),
      tap(() => this.refreshUnreadCount())
    );
  }

  markAllAsRead(): Observable<string> {
    return this.http.put(
      `${this.base}/read/all`, {},
      { responseType: 'text' }
    ).pipe(
      tap(() => this._unreadCount.next(0))
    );
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`,
      { responseType: 'text' }
    );
  }

  deleteRead(): Observable<string> {
    return this.http.delete(`${this.base}/read/all`,
      { responseType: 'text' });
  }

  private normalizeNotification(notification: Notification): Notification {
    const read = notification.isRead ?? notification.read ?? false;
    return { ...notification, isRead: read };
  }
}
