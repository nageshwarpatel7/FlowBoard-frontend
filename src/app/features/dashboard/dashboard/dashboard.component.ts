import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Workspace } from '../../../core/models/workspace.model';
import { UserProfile } from '../../../core/models/user.model';
import { ColorPickerComponent } from '../../../shared/components/color-picker/color-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatMenuModule, MatDividerModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, ColorPickerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private fb               = inject(FormBuilder);
  private auth             = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private notifService     = inject(NotificationService);
  public  router           = inject(Router);
  private snack            = inject(MatSnackBar);

  workspaces: Workspace[]   = [];
  currentUser: UserProfile | null = null;
  loading       = true;
  creating      = false;
  showCreateForm = false;
  showNotifDropdown = false;
  unreadCount   = 0;

  createForm = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    visibility:  ['PRIVATE', Validators.required]
  });

  get name() { return this.createForm.get('name')!; }

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: user => {
        this.currentUser = user;
        this.loadWorkspaces(user.id);
      },
      error: () => this.auth.logout()
    });
    this.notifService.unreadCount$.subscribe(
      (c: number) => this.unreadCount = c);
    this.notifService.refreshUnreadCount();
  }

  loadWorkspaces(userId: number): void {
    this.loading = true;
    this.workspaceService.getByMember(userId).subscribe({
      next: ws => { this.workspaces = ws; this.loading = false; },
      error: ()  => {
        this.loading = false;
        this.snack.open('Failed to load workspaces', 'Close',
          { duration: 3000 });
      }
    });
  }

  createWorkspace(): void {
    if (this.createForm.invalid) return;
    this.creating = true;

    this.workspaceService.create(this.createForm.value as any)
      .subscribe({
        next: ws => {
          this.workspaces.unshift(ws);
          this.creating = false;
          this.showCreateForm = false;
          this.createForm.reset({ visibility: 'PRIVATE' });
          this.snack.open('Workspace created!', 'Close',
            { duration: 3000 });
        },
        error: err => {
          this.creating = false;
          this.snack.open(
            err.error?.message ?? 'Create failed',
            'Close', { duration: 4000 });
        }
      });
  }

  openWorkspace(id: number): void {
    this.router.navigate(['/workspace', id]);
  }

  deleteWorkspace(id: number, e: Event): void {
    e.stopPropagation();
    if (!confirm('Delete this workspace?')) return;

    this.workspaceService.delete(id).subscribe({
      next: () => {
        this.workspaces = this.workspaces.filter(w => w.id !== id);
        this.snack.open('Workspace deleted', 'Close',
          { duration: 3000 });
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout(): void { this.auth.logout(); }

  getWorkspaceColor(wsId: number): string | null {
    return localStorage.getItem(`ws-color-${wsId}`);
  }

  setWorkspaceColor(wsId: number, color: string | null) {
    if (color) {
      localStorage.setItem(`ws-color-${wsId}`, color);
    } else {
      localStorage.removeItem(`ws-color-${wsId}`);
    }
  }
}