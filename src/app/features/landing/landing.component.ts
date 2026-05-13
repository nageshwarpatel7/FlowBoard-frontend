import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  readonly highlights = [
    {
      icon: 'dashboard_customize',
      title: 'Workspace boards',
      text: 'Organize teams, projects, and boards from one focused home.'
    },
    {
      icon: 'view_kanban',
      title: 'Task flow',
      text: 'Create lists and cards, track status, assign work, and keep delivery visible.'
    },
    {
      icon: 'notifications_active',
      title: 'Team signals',
      text: 'Use notifications, activity, and member views to stay aligned.'
    },
    {
      icon: 'admin_panel_settings',
      title: 'Admin controls',
      text: 'Manage users, workspaces, boards, and platform health from the admin area.'
    }
  ];
}
