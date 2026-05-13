import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, of, switchMap, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { BoardService } from '../../../core/services/board.service';
import { AuthService } from '../../../core/services/auth.service';
import { Workspace } from '../../../core/models/workspace.model';
import { Board } from '../../../core/models/board.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {

  private workspaceService = inject(WorkspaceService);
  private boardService     = inject(BoardService);
  private authService      = inject(AuthService);
  private router           = inject(Router);

  searchControl = new FormControl('', { nonNullable: true });
  
  boards: Board[] = [];
  workspaces: Workspace[] = [];
  private allBoards: Board[] = [];
  private allWorkspaces: Workspace[] = [];
  
  loading = false;
  showResults = false;
  dataLoaded = false;

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => {
        if (!val || val.length < 2) {
          this.showResults = false;
          return forkJoin({ boards: of([]), workspaces: of([]) });
        }
        this.loading = true;
        this.showResults = true;
        return this.ensureSearchData().pipe(
          switchMap(() => of(this.filterResults(val)))
        );
      })
    ).subscribe({
      next: res => {
        this.boards = res.boards;
        this.workspaces = res.workspaces;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showResults = false;
      }
    });
  }

  private ensureSearchData() {
    if (this.dataLoaded) return of(null);

    const userId = this.authService.getUserId();
    return forkJoin({
      boards: this.boardService.getByMember(userId).pipe(catchError(() => of([]))),
      workspaces: this.workspaceService.getByMember(userId).pipe(catchError(() => of([])))
    }).pipe(
      tap(res => {
        this.allBoards = res.boards;
        this.allWorkspaces = res.workspaces;
        this.dataLoaded = true;
      }),
      switchMap(() => of(null))
    );
  }

  private filterResults(value: string): { boards: Board[]; workspaces: Workspace[] } {
    const query = value.trim().toLowerCase();
    return {
      boards: this.allBoards.filter(board =>
        board.name.toLowerCase().includes(query) ||
        (board.description || '').toLowerCase().includes(query)
      ),
      workspaces: this.allWorkspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(query) ||
        (workspace.description || '').toLowerCase().includes(query)
      )
    };
  }

  navigateTo(type: 'workspace' | 'board', id: number): void {
    this.showResults = false;
    this.searchControl.setValue('');
    if (type === 'workspace') {
      this.router.navigate(['/workspace', id]);
    } else {
      this.router.navigate(['/board', id]);
    }
  }

  closeResults(): void {
    setTimeout(() => this.showResults = false, 200);
  }
}
