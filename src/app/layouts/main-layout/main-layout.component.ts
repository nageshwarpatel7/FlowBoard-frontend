import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationCenterComponent } from '../../features/notification/notification-center/notification-center.component';
import { SearchComponent } from '../../features/dashboard/search/search.component';
import * as AuthSelectors from '../../store/auth/auth.selectors';
import * as AuthActions from '../../store/auth/auth.actions';
import { UserProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterOutlet,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatDividerModule, MatTooltipModule, NotificationCenterComponent, SearchComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  readonly authService    = inject(AuthService);
  private store           = inject(Store);
  private paymentService  = inject(PaymentService);

  user$: Observable<UserProfile | null> = this.store.select(AuthSelectors.selectUser);
  isDarkMode = false;
  private readonly themeStorageKey = 'flowboard-theme';

  planName = computed(() => {
    if (!this.paymentService.subscriptionLoaded()) return 'Checking';
    const p = this.paymentService.currentPlan();
    return p?.planDisplayName ?? 'Free';
  });

  isFreeUser = computed(() => {
    if (!this.paymentService.subscriptionLoaded()) return false;
    const p = this.paymentService.currentPlan();
    return !p || p.planName === 'FREE' || p.status !== 'ACTIVE';
  });

  subscriptionLoaded = this.paymentService.subscriptionLoaded;

  ngOnInit() {
    this.store.dispatch(AuthActions.getProfile());
    this.paymentService.getSubscription().subscribe();
    this.isDarkMode = this.getStoredTheme() === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem(this.themeStorageKey, this.isDarkMode ? 'dark' : 'light');
  }

  private getStoredTheme(): 'dark' | 'light' {
    const storedTheme = localStorage.getItem(this.themeStorageKey);

    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme() {
    document.body.classList.toggle('dark', this.isDarkMode);
    document.body.classList.toggle('light', !this.isDarkMode);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
