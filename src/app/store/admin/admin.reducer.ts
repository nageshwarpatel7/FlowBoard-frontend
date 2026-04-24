import { createReducer, on } from '@ngrx/store';
import { initialAdminState } from './admin.state';
import * as AdminActions from './admin.actions';

export const adminReducer = createReducer(
  initialAdminState,

  // ── Stats ──────────────────────────────────────────────────────────────────
  on(AdminActions.loadAdminStats, state => ({ ...state, loading: true, error: null })),
  on(AdminActions.loadAdminStatsSuccess, (state, { stats }) => ({ ...state, stats, loading: false })),
  on(AdminActions.loadAdminStatsFailure, (state, { error }) => ({ ...state, error, loading: false })),

  // ── Users ──────────────────────────────────────────────────────────────────
  on(AdminActions.loadAllUsers, state => ({ ...state, loading: true, error: null })),
  on(AdminActions.loadAllUsersSuccess, (state, { users }) => ({ ...state, users, loading: false })),
  on(AdminActions.loadAllUsersFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AdminActions.updateUserRoleSuccess, (state, { userId, role }) => ({
    ...state,
    users: state.users.map(u => u.id === userId ? { ...u, role: role as any } : u)
  })),

  on(AdminActions.deactivateUserSuccess, (state, { userId }) => ({
    ...state,
    users: state.users.map(u => u.id === userId ? { ...u, active: false } : u)
  })),

  on(AdminActions.reactivateUserSuccess, (state, { userId }) => ({
    ...state,
    users: state.users.map(u => u.id === userId ? { ...u, active: true } : u)
  })),


  on(AdminActions.deleteUserSuccess, (state, { userId }) => ({
    ...state,
    users: state.users.filter(u => u.id !== userId)
  })),

  // ── Workspaces ─────────────────────────────────────────────────────────────
  on(AdminActions.loadAdminWorkspaces, state => ({ ...state, loading: true })),
  on(AdminActions.loadAdminWorkspacesSuccess, (state, { workspaces }) => ({ ...state, workspaces, loading: false })),
  on(AdminActions.loadAdminWorkspacesFailure, (state, { error }) => ({ ...state, error, loading: false })),

  // ── Boards ─────────────────────────────────────────────────────────────────
  on(AdminActions.loadAdminBoards, state => ({ ...state, loading: true })),
  on(AdminActions.loadAdminBoardsSuccess, (state, { boards }) => ({ ...state, boards, loading: false })),
  on(AdminActions.loadAdminBoardsFailure, (state, { error }) => ({ ...state, error, loading: false })),
);
