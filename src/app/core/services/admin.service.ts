import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';
import { Workspace } from '../models/workspace.model';
import { Board } from '../models/board.model';

export interface AdminStats {
  totalUsers: number;
  totalWorkspaces: number;
  totalBoards: number;
  activeUsersToday: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private authBase = `${environment.apiUrl}/auth/admin`;
  private workspaceBase = `${environment.apiUrl}/workspaces/admin`;
  private boardBase = `${environment.apiUrl}/boards/admin`;

  getStats(): Observable<AdminStats> {
    // This could be aggregated, but for now let's point to auth-service stats
    return this.http.get<AdminStats>(`${this.authBase}/stats`);
  }

  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.authBase}/users`);
  }

  updateUserRole(userId: number, role: string): Observable<string> {
    return this.http.put(
      `${this.authBase}/users/${userId}/role`,
      { role },
      { responseType: 'text' }
    );
  }

  deactivateUser(userId: number): Observable<string> {
    return this.http.put(
      `${this.authBase}/users/${userId}/suspend`,
      {},
      { responseType: 'text' }
    );
  }

  reactivateUser(userId: number): Observable<string> {
    return this.http.put(
      `${this.authBase}/users/${userId}/reactivate`,
      {},
      { responseType: 'text' }
    );
  }


  deleteUser(userId: number): Observable<string> {
    return this.http.delete(
      `${this.authBase}/users/${userId}`,
      { responseType: 'text' }
    );
  }

  getAllWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.workspaceBase}`);
  }

  getAllBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.boardBase}`);
  }
}

