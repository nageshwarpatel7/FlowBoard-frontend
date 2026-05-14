import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Notification } from '../../../core/models/notification.model';
import * as NotificationActions from '../../../store/notification/notification.actions';
import * as NotificationSelectors from '../../../store/notification/notification.selectors';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.scss'
})
export class NotificationPageComponent implements OnInit {
  private store = inject(Store);

  notifications$: Observable<Notification[]> = this.store.select(NotificationSelectors.selectAllNotifications);
  unreadCount$: Observable<number> = this.store.select(NotificationSelectors.selectUnreadCount);
  loading$: Observable<boolean> = this.store.select(NotificationSelectors.selectNotificationLoading);

  ngOnInit(): void {
    this.store.dispatch(NotificationActions.loadNotifications());
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.store.dispatch(NotificationActions.markAsRead({ id: notification.id }));
    }
  }

  markAllAsRead(): void {
    this.store.dispatch(NotificationActions.markAllAsRead());
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'ASSIGNMENT': return 'person_add';
      case 'DUE_DATE': return 'event';
      case 'OVERDUE': return 'error';
      case 'COMMENT': return 'comment';
      case 'MENTION': return 'alternate_email';
      case 'INVITE': return 'group_add';
      default: return 'notifications';
    }
  }

  getInviteToken(notification: Notification): string | null {
    if (notification.type !== 'INVITE' || !notification.deepLinkUrl) return null;
    try {
      const url = new URL(notification.deepLinkUrl, window.location.origin);
      return url.searchParams.get('token');
    } catch {
      return null;
    }
  }
}
