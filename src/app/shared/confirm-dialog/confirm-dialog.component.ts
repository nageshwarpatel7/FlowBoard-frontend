import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon" [class.danger]="data.danger">
        <mat-icon>{{ data.icon || (data.danger ? 'warning' : 'help_outline') }}</mat-icon>
      </div>
      <h2 class="dialog-title">{{ data.title }}</h2>
      <p class="dialog-message">{{ data.message }}</p>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="cancel()" id="confirm-dialog-cancel">
          {{ data.cancelLabel || 'Cancel' }}
        </button>
        <button
          mat-flat-button
          [class.danger-btn]="data.danger"
          (click)="confirm()"
          id="confirm-dialog-confirm">
          {{ data.confirmLabel || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 32px;
      text-align: center;
      max-width: 400px;
    }
    .dialog-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e0e7ff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      mat-icon { color: #4f46e5; font-size: 28px; width: 28px; height: 28px; }
    }
    .dialog-icon.danger {
      background: #fee2e2;
      mat-icon { color: #ef4444; }
    }
    .dialog-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 10px;
    }
    .dialog-message {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      button { min-width: 120px; border-radius: 10px !important; font-weight: 700 !important; }
    }
    .danger-btn {
      background: #ef4444 !important;
      color: #fff !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  confirm(): void { this.dialogRef.close(true); }
  cancel(): void  { this.dialogRef.close(false); }
}
