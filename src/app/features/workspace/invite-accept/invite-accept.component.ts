import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-invite-accept',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="invite-wrapper">
      <div class="invite-card">
        <div class="invite-icon">
          <mat-icon>mail</mat-icon>
        </div>
        <ng-container *ngIf="status === 'loading'">
          <h2>Accepting Invitation…</h2>
          <p>Please wait while we process your invitation.</p>
        </ng-container>
        <ng-container *ngIf="status === 'success'">
          <h2>Invitation Accepted!</h2>
          <p>You have successfully joined the workspace.</p>
          <button mat-flat-button color="primary" (click)="goToDashboard()">Go to Dashboard</button>
        </ng-container>
        <ng-container *ngIf="status === 'error'">
          <h2>Invalid Invitation</h2>
          <p>{{ errorMsg }}</p>
          <button mat-flat-button color="primary" (click)="goToDashboard()">Go to Dashboard</button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .invite-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .invite-card {
      background: #fff;
      border-radius: 20px;
      padding: 48px 40px;
      text-align: center;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .invite-icon {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: #ede9fe;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      mat-icon { color: #6366f1; font-size: 32px; width: 32px; height: 32px; }
    }
    h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
    p  { font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.6; }
    button { border-radius: 10px !important; font-weight: 700 !important; padding: 10px 28px !important; }
  `]
})
export class InviteAcceptComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private http   = inject(HttpClient);

  status: 'loading' | 'success' | 'error' = 'loading';
  errorMsg = 'This invitation is invalid or has expired.';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status = 'error';
      return;
    }
    this.http.post(
      `${environment.apiUrl}/workspace/invite/accept?token=${token}`, {},
      { responseType: 'text' }
    ).subscribe({
      next: () => { this.status = 'success'; },
      error: err => {
        this.status   = 'error';
        this.errorMsg = err.error?.message || 'This invitation is invalid or has expired.';
      }
    });
  }

  goToDashboard(): void { this.router.navigate(['/dashboard']); }
}
