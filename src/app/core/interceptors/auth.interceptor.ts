import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/** Public endpoints that must NEVER have an Authorization header attached */
const PUBLIC_PATHS = [
  '/auth/register',
  '/auth/login',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/oauth2',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Skip auth headers for known public endpoints
  const isPublic = PUBLIC_PATHS.some(p => req.url.includes(p));

  let authReq = req;

  if (token && !isPublic) {
    const isFormData = req.body instanceof FormData;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    // Only add X-User-Id when we actually have a value
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    // Don't override Content-Type for multipart form data
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    authReq = req.clone({ setHeaders: headers });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isPublic) {
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};