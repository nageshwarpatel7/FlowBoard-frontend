import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private paymentService = inject(PaymentService);

  readonly showUpgrade = computed(() => {
    if (!this.paymentService.subscriptionLoaded()) return false;
    const plan = this.paymentService.currentPlan();
    return !plan || plan.planName === 'FREE' || plan.status !== 'ACTIVE';
  });

  readonly planName = computed(() => {
    const plan = this.paymentService.currentPlan();
    return plan?.planDisplayName ?? 'Free';
  });
}
