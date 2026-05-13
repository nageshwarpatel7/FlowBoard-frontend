import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'oauth2/callback', loadComponent: () => import('./features/auth/oauth2-callback/oauth2-callback.component').then(m => m.Oauth2CallbackComponent) },
  { path: 'invite/accept', loadComponent: () => import('./features/workspace/invite-accept/invite-accept.component').then(m => m.InviteAcceptComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'workspace/:id', loadComponent: () => import('./features/workspace/workspace-detail/workspace-detail.component').then(m => m.WorkspaceDetailComponent) },
      { path: 'board/:id', loadComponent: () => import('./features/board/board-view/board-view.component').then(m => m.BoardViewComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notification/notification-center/notification-center.component').then(m => m.NotificationCenterComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent) },
      { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent) },
      { path: 'pricing', loadComponent: () => import('./features/payment/pricing/pricing.component').then(m => m.PricingComponent) },
      { path: 'payment/success', loadComponent: () => import('./features/payment/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) },
      { path: 'payment/cancel', loadComponent: () => import('./features/payment/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
