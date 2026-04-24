import { UserProfile } from '../../core/models/user.model';
import { Workspace } from '../../core/models/workspace.model';
import { Board } from '../../core/models/board.model';
import { AdminStats } from '../../core/services/admin.service';

export interface AdminState {
  users: UserProfile[];
  workspaces: Workspace[];
  boards: Board[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

export const initialAdminState: AdminState = {
  users: [],
  workspaces: [],
  boards: [],
  stats: null,
  loading: false,
  error: null
};
