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
import * as AuthSelectors from '../../store/auth/auth.selectors';
import * as AuthActions from '../../store/auth/auth.actions';
import { UserProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterOutlet,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatDividerModule, MatTooltipModule, NotificationCenterComponent
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

  planName = computed(() => {
    const p = this.paymentService.currentPlan();
    return p?.planDisplayName ?? 'Free';
  });

  isFreeUser = computed(() => {
    const p = this.paymentService.currentPlan();
    return !p || p.planName === 'FREE';
  });

  ngOnInit() {
    this.store.dispatch(AuthActions.getProfile());
    this.paymentService.getSubscription().subscribe();
    this.isDarkMode = document.body.classList.contains('dark');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}