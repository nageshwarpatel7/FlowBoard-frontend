import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../../../core/services/payment.service';
import { Subscription as RxSubscription } from 'rxjs';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <div class="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-2xl">
        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <mat-icon class="text-green-500" style="font-size:36px;width:36px;height:36px;">check_circle</mat-icon>
        </div>
        <h1 class="text-2xl font-black text-slate-800 mb-2">Payment Successful!</h1>
        <p class="text-slate-500 text-sm mb-1">{{ statusMessage }}</p>
        <p class="text-slate-500 text-sm mb-8">Welcome to {{ planName }}.</p>
        @if (syncError) {
          <p class="text-red-600 text-sm mb-6">{{ syncError }}</p>
        }
        <div class="space-y-3">
          <button mat-flat-button color="primary" routerLink="/dashboard" class="w-full rounded-xl font-bold py-3">
            Go to Dashboard
          </button>
          <button mat-button routerLink="/pricing" class="w-full text-slate-500 text-sm">View subscription details</button>
        </div>
        <p class="text-xs text-slate-400 mt-6">Redirecting to dashboard in {{ countdown }}s...</p>
      </div>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private confirmSubscription?: RxSubscription;
  private refreshSubscription?: RxSubscription;
  private redirectTimer?: ReturnType<typeof setInterval>;
  private redirectStarted = false;

  countdown = 5;
  planName = 'FlowBoard';
  statusMessage = 'Finalizing your subscription...';
  syncError = '';

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.waitForActiveSubscription();
      return;
    }

    this.confirmSubscription = this.paymentService.confirmCheckoutSession(sessionId).subscribe({
      next: sub => {
        this.planName = sub.planDisplayName;
        this.statusMessage = 'Your subscription is active.';
        this.syncError = '';
        this.startRedirect(2);
      },
      error: err => {
        this.syncError = this.getErrorMessage(err);
        this.waitForActiveSubscription();
      }
    });
  }

  ngOnDestroy(): void {
    this.confirmSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
    if (this.redirectTimer) clearInterval(this.redirectTimer);
  }

  private waitForActiveSubscription(): void {
    this.refreshSubscription = this.paymentService.refreshSubscriptionUntilActivePaid().subscribe({
      next: sub => {
        if (!this.paymentService.isActivePaidSubscription(sub)) return;

        this.planName = sub.planDisplayName;
        this.statusMessage = 'Your subscription is active.';
        this.syncError = '';
        this.startRedirect(2);
      },
      error: () => this.startRedirect(5),
      complete: () => {
        if (!this.redirectStarted) {
          this.statusMessage = 'Payment received, but your plan is still syncing.';
          this.syncError = 'Please stay on this page or refresh after a few seconds.';
        }
      }
    });
  }

  private getErrorMessage(err: any): string {
    if (err?.status === 404) {
      return 'Payment sync endpoint is not available. Restart the payment service with the latest build.';
    }
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    return 'Could not sync payment yet. Retrying...';
  }

  private startRedirect(seconds: number): void {
    if (this.redirectStarted) return;

    this.redirectStarted = true;
    this.countdown = seconds;
    this.redirectTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        if (this.redirectTimer) clearInterval(this.redirectTimer);
        this.router.navigate(['/dashboard']);
      }
    }, 1000);
  }
}
