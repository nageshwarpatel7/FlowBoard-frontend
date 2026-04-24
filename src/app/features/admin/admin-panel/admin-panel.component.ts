import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { map } from 'rxjs/operators';

import * as AdminActions from '../../../store/admin/admin.actions';
import * as AdminSelectors from '../../../store/admin/admin.selectors';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { UserProfile } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatDialogModule
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  private store  = inject(Store);
  private dialog = inject(MatDialog);

  // ── Observables ──────────────────────────────────────────────────────────
  users$      = this.store.select(AdminSelectors.selectAdminUsers);
  stats$      = this.store.select(AdminSelectors.selectAdminStats);
  loading$    = this.store.select(AdminSelectors.selectAdminLoading);
  workspaces$ = this.store.select(AdminSelectors.selectAdminWorkspaces);
  boards$     = this.store.select(AdminSelectors.selectAdminBoards);

  // ── Search / filter ──────────────────────────────────────────────────────
  userSearch   = '';
  wsSearch     = '';
  boardSearch  = '';
  roleFilter   = 'ALL';

  // ── Filtered observables ─────────────────────────────────────────────────
  filteredUsers$ = this.users$.pipe(
    map(users => this.filterUsers(users))
  );

  filteredWorkspaces$ = this.workspaces$.pipe(
    map(ws => ws.filter(w =>
      w.name.toLowerCase().includes(this.wsSearch.toLowerCase())
    ))
  );

  filteredBoards$ = this.boards$.pipe(
    map(bs => bs.filter(b =>
      b.name.toLowerCase().includes(this.boardSearch.toLowerCase())
    ))
  );

  // ── Table columns ────────────────────────────────────────────────────────
  userColumns      = ['avatar', 'name', 'email', 'role', 'status', 'joined', 'actions'];
  workspaceColumns = ['icon', 'name', 'visibility', 'members', 'created'];
  boardColumns     = ['icon', 'name', 'workspace', 'visibility', 'members', 'created'];

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadAdminStats());
    this.store.dispatch(AdminActions.loadAllUsers());
    this.store.dispatch(AdminActions.loadAdminWorkspaces());
    this.store.dispatch(AdminActions.loadAdminBoards());
  }

  // ── User actions ─────────────────────────────────────────────────────────
  changeRole(userId: number, role: string): void {
    this.store.dispatch(AdminActions.updateUserRole({ userId, role }));
  }

  confirmDeactivate(user: UserProfile): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate Account',
        message: `Are you sure you want to deactivate ${user.fullName}'s account? They will no longer be able to log in.`,
        confirmLabel: 'Deactivate',
        danger: true,
        icon: 'block'
      },
      panelClass: 'confirm-dialog-panel'
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.store.dispatch(AdminActions.deactivateUser({ userId: user.id }));
    });
  }

  confirmReactivate(user: UserProfile): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reactivate Account',
        message: `Are you sure you want to reactivate ${user.fullName}'s account? They will be able to log in again.`,
        confirmLabel: 'Reactivate',
        danger: false,
        icon: 'how_to_reg'
      },
      panelClass: 'confirm-dialog-panel'
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.store.dispatch(AdminActions.reactivateUser({ userId: user.id }));
    });
  }


  confirmDelete(user: UserProfile): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `This will permanently delete ${user.fullName}'s account and all their data. This action cannot be undone.`,
        confirmLabel: 'Delete Permanently',
        danger: true,
        icon: 'delete_forever'
      },
      panelClass: 'confirm-dialog-panel'
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.store.dispatch(AdminActions.deleteUser({ userId: user.id }));
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  filterUsers(users: UserProfile[]): UserProfile[] {
    const q = this.userSearch.toLowerCase();
    return users.filter(u => {
      const matchSearch = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q);
      const matchRole = this.roleFilter === 'ALL' || u.role === this.roleFilter;
      return matchSearch && matchRole;
    });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
      '#f59e0b', '#10b981', '#14b8a6', '#3b82f6'
    ];
    let hash = 0;
    for (const c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  onUserSearchChange(): void {
    this.filteredUsers$ = this.users$.pipe(map(users => this.filterUsers(users)));
  }

  onWsSearchChange(): void {
    this.filteredWorkspaces$ = this.workspaces$.pipe(
      map(ws => ws.filter(w => w.name.toLowerCase().includes(this.wsSearch.toLowerCase())))
    );
  }

  onBoardSearchChange(): void {
    this.filteredBoards$ = this.boards$.pipe(
      map(bs => bs.filter(b => b.name.toLowerCase().includes(this.boardSearch.toLowerCase())))
    );
  }

  trackById(_: number, item: { id: number }) { return item.id; }
}
