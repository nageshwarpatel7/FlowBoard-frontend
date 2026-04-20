import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../../../core/services/payment.service';

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
        <p class="text-slate-500 text-sm mb-1">Your subscription has been activated.</p>
        <p class="text-slate-500 text-sm mb-8">Welcome to FlowBoard Pro!</p>
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
export class PaymentSuccessComponent implements OnInit {
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  countdown = 5;

  ngOnInit() {
    this.paymentService.getSubscription().subscribe();
    const t = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) { clearInterval(t); this.router.navigate(['/dashboard']); }
    }, 1000);
  }
}