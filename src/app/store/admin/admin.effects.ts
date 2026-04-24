import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AdminService } from '../../core/services/admin.service';
import * as AdminActions from './admin.actions';

@Injectable()
export class AdminEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);

  // ── Stats ──────────────────────────────────────────────────────────────────
  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminStats),
      switchMap(() =>
        this.adminService.getStats().pipe(
          map(stats => AdminActions.loadAdminStatsSuccess({ stats })),
          catchError(err => of(AdminActions.loadAdminStatsFailure({ error: err.error?.message || 'Failed to load stats' })))
        )
      )
    )
  );

  // ── Users ──────────────────────────────────────────────────────────────────
  loadAllUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAllUsers),
      switchMap(() =>
        this.adminService.getAllUsers().pipe(
          map(users => AdminActions.loadAllUsersSuccess({ users })),
          catchError(err => of(AdminActions.loadAllUsersFailure({ error: err.error?.message || 'Failed to load users' })))
        )
      )
    )
  );

  updateUserRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateUserRole),
      switchMap(({ userId, role }) =>
        this.adminService.updateUserRole(userId, role).pipe(
          map(() => AdminActions.updateUserRoleSuccess({ userId, role })),
          catchError(err => of(AdminActions.updateUserRoleFailure({ error: err.error?.message || 'Failed to update role' })))
        )
      )
    )
  );

  deactivateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.deactivateUser),
      switchMap(({ userId }) =>
        this.adminService.deactivateUser(userId).pipe(
          map(() => AdminActions.deactivateUserSuccess({ userId })),
          catchError(err => of(AdminActions.deactivateUserFailure({ error: err.error?.message || 'Failed to deactivate user' })))
        )
      )
    )
  );

  reactivateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.reactivateUser),
      switchMap(({ userId }) =>
        this.adminService.reactivateUser(userId).pipe(
          map(() => AdminActions.reactivateUserSuccess({ userId })),
          catchError(err => of(AdminActions.reactivateUserFailure({ error: err.error?.message || 'Failed to reactivate user' })))
        )
      )
    )
  );


  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.deleteUser),
      switchMap(({ userId }) =>
        this.adminService.deleteUser(userId).pipe(
          map(() => AdminActions.deleteUserSuccess({ userId })),
          catchError(err => of(AdminActions.deleteUserFailure({ error: err.error?.message || 'Failed to delete user' })))
        )
      )
    )
  );

  // ── Workspaces ─────────────────────────────────────────────────────────────
  loadWorkspaces$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminWorkspaces),
      switchMap(() =>
        this.adminService.getAllWorkspaces().pipe(
          map(workspaces => AdminActions.loadAdminWorkspacesSuccess({ workspaces })),
          catchError(err => of(AdminActions.loadAdminWorkspacesFailure({ error: err.error?.message || 'Failed to load workspaces' })))
        )
      )
    )
  );

  // ── Boards ─────────────────────────────────────────────────────────────────
  loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminBoards),
      switchMap(() =>
        this.adminService.getAllBoards().pipe(
          map(boards => AdminActions.loadAdminBoardsSuccess({ boards })),
          catchError(err => of(AdminActions.loadAdminBoardsFailure({ error: err.error?.message || 'Failed to load boards' })))
        )
      )
    )
  );
}
