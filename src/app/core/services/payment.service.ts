import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, switchMap, take, takeWhile, tap, throwError, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Plan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxWorkspaces: number;
  maxBoardsPerWorkspace: number;
  maxMembersPerWorkspace: number;
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasCustomFields: boolean;
  hasAutomation: boolean;
}

export interface Subscription {
  id: number;
  planName: string;
  planDisplayName: string;
  status: string;
  billingCycle: string;
  currentPeriodEnd: string;
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasCustomFields: boolean;
  hasAutomation: boolean;
  maxWorkspaces: number;
  maxBoardsPerWorkspace: number;
}

export interface CheckoutSession { sessionId: string; checkoutUrl: string; }

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments`;

  readonly currentPlan = signal<Subscription | null>(null);
  readonly isPro = signal(false);
  readonly isBusiness = signal(false);
  readonly subscriptionLoaded = signal(false);
  readonly subscriptionError = signal('');

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.base}/plans`);
  }

  getSubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.base}/subscription`).pipe(
      tap(sub => {
        this.setSubscriptionState(sub);
        this.subscriptionLoaded.set(true);
        this.subscriptionError.set('');
      }),
      catchError(err => {
        this.subscriptionLoaded.set(true);
        this.subscriptionError.set(err?.error?.message || 'Unable to load subscription');
        return throwError(() => err);
      })
    );
  }

  refreshSubscriptionUntilActivePaid(
    maxAttempts = 12,
    intervalMs = 1500
  ): Observable<Subscription> {
    return timer(0, intervalMs).pipe(
      take(maxAttempts),
      switchMap(() => this.getSubscription()),
      takeWhile(sub => !this.isActivePaidSubscription(sub), true)
    );
  }

  createCheckout(planId: number, billingCycle: 'MONTHLY' | 'YEARLY'): Observable<CheckoutSession> {
    return this.http.post<CheckoutSession>(`${this.base}/checkout`, { planId, billingCycle });
  }

  confirmCheckoutSession(sessionId: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.base}/checkout/confirm`, { sessionId }).pipe(
      tap(sub => this.setSubscriptionState(sub))
    );
  }

  cancelSubscription(): Observable<string> {
    return this.http.post(`${this.base}/cancel`, {}, { responseType: 'text' }).pipe(
      tap(() => {
        const current = this.currentPlan();
        if (current) {
          this.setSubscriptionState({ ...current, status: 'CANCELLED' });
        }
      })
    );
  }

  hasFeature(feature: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/feature/${feature}`);
  }

  getPaymentHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/history`);
  }

  isPaidPlan(): boolean {
    const plan = this.currentPlan();
    return plan !== null && this.isActivePaidSubscription(plan);
  }

  isActivePaidSubscription(sub: Subscription): boolean {
    return sub.planName !== 'FREE' && sub.status === 'ACTIVE';
  }

  canCreateWorkspace(currentCount: number): boolean {
    const plan = this.currentPlan();
    if (!plan) return currentCount < 3;
    return plan.maxWorkspaces === -1 || currentCount < plan.maxWorkspaces;
  }

  private setSubscriptionState(sub: Subscription): void {
    this.currentPlan.set(sub);
    this.isPro.set(sub.planName === 'PRO' && sub.status === 'ACTIVE');
    this.isBusiness.set(sub.planName === 'BUSINESS' && sub.status === 'ACTIVE');
  }
}
