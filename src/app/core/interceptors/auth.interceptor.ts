import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id':     userId ?? '',
        'Content-Type':  'application/json'
      }
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};