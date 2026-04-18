import { Component, inject, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ColorPickerComponent } from '../../../shared/components/color-picker/color-picker.component';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Card, CardActivity, CardStatus, Priority } from '../../../core/models/card.model';
import * as BoardActions from '../../../store/board/board.actions';
import * as BoardSelectors from '../../../store/board/board.selectors';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatIconModule,
    MatButtonModule, 
    MatDividerModule, 
    MatProgressSpinnerModule, 
    MatMenuModule,
    MatProgressBarModule,
    MatCheckboxModule,
    ColorPickerComponent
  ],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.scss'
})
export class CardDetailComponent implements OnInit, OnDestroy {
  private fb    = inject(FormBuilder);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  card$ = this.store.select(BoardSelectors.selectSelectedBoard).pipe(
    // Selection logic would ideally select from a card entities map if we scale up,
    // but for now we follow the existing board-view selected card pattern.
  );
  
  @Input() card!: Card;
  @Output() cardUpdated = new EventEmitter<Card>();
  @Output() cardDeleted = new EventEmitter<{ cardId: number; listId: number }>();
  @Output() closed      = new EventEmitter<void>();

  editMode = false;
  saving$   = this.store.select(BoardSelectors.selectBoardLoading);
  
  // Feature flags for "Senior" features
  showChecklist = true;
  showComments  = true;

  editForm = this.fb.group({
    description: ['']
  });

  statuses: CardStatus[] = ['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
  priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  statusLabels: Record<CardStatus, string> = {
    TO_DO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done'
  };

  ngOnInit(): void {
    // In a real NgRx app, we'd select the card from the store based on an ID in the route or 
    // a 'selectedCardId' in the state.
    // For this transition, we'll keep the component receptive to the store.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveDescription(): void {
    if (!this.card) return;
    this.updateCard({ description: this.editForm.value.description! });
    this.editMode = false;
  }

  setStatus(status: CardStatus): void {
    this.updateCard({ status });
  }

  setPriority(priority: Priority): void {
    this.updateCard({ priority });
  }

  updateCard(changes: Partial<Card>): void {
    if (!this.card) return;
    const updated = { ...this.card, ...changes } as Card;
    this.cardUpdated.emit(updated);
  }

  updateCoverColor(color: string | null): void {
    this.updateCard({ coverColor: color || undefined });
  }

  deleteCard(): void {
    if (!this.card || !confirm('Delete this card?')) return;
    // this.store.dispatch(BoardActions.deleteCard({ id: this.card.id }));
  }

  close(): void {
    this.closed.emit();
  }
}