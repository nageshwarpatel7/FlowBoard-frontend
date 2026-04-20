import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService, Plan, Subscription } from '../../../core/services/payment.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule,
            MatSnackBarModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './pricing.component.html'
})
export class PricingComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private snack          = inject(MatSnackBar);

  plans       = signal<Plan[]>([]);
  subscription = signal<Subscription | null>(null);
  billing     = signal<'MONTHLY' | 'YEARLY'>('MONTHLY');
  loading     = signal(true);
  purchasing  = signal(false);

  ngOnInit() {
    this.paymentService.getPlans().subscribe({
      next: p => { this.plans.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.paymentService.getSubscription().subscribe({
      next: s => this.subscription.set(s), error: () => {}
    });
  }

  getPrice(p: Plan): number {
    return this.billing() === 'YEARLY' ? +(p.priceYearly / 12).toFixed(2) : p.priceMonthly;
  }

  getYearlySavings(p: Plan): number {
    if (!p.priceMonthly) return 0;
    return Math.round(((p.priceMonthly * 12) - p.priceYearly) / (p.priceMonthly * 12) * 100);
  }

  isCurrentPlan(p: Plan): boolean {
    const s = this.subscription();
    return !!s && s.planName === p.name && s.status === 'ACTIVE';
  }

  subscribe(p: Plan): void {
    if (p.name === 'FREE' || this.purchasing()) return;
    this.purchasing.set(true);
    this.paymentService.createCheckout(p.id, this.billing()).subscribe({
      next: s => { window.location.href = s.checkoutUrl; },
      error: err => {
        this.purchasing.set(false);
        this.snack.open(err.error?.message || 'Payment failed', 'Close', { duration: 4000 });
      }
    });
  }

  cancel(): void {
    if (!confirm('Cancel subscription? You keep access until period ends.')) return;
    this.paymentService.cancelSubscription().subscribe({
      next: () => {
        const s = this.subscription();
        if (s) this.subscription.set({ ...s, status: 'CANCELLED' });
        this.snack.open('Subscription cancelled', 'Close', { duration: 3000 });
      },
      error: () => this.snack.open('Failed to cancel', 'Close', { duration: 3000 })
    });
  }
}