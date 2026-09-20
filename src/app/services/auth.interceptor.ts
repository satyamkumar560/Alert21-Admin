import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

let lastUnauthorizedToastTime = 0;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  const token = authService.getToken();
  let authReq = req;

  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  const isAuthRequest = req.url.includes('/login') || req.url.includes('/auth');

  return next(authReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.body) {
        const body = event.body as any;
        if (
          body.success === false && 
          body.message && 
          (body.message.toLowerCase().includes('expired') || body.message.toLowerCase().includes('invalid token'))
        ) {
          const now = Date.now();
          if (authService.isLoggedIn() && now - lastUnauthorizedToastTime > 8000) {
            lastUnauthorizedToastTime = now;
            toastService.showError('Session Expired', 'Your admin session has expired. Please login again.');
          }
          authService.logout();
        } else if (body.success === false && body.message && req.method !== 'GET' && !isAuthRequest) {
          toastService.showError('API Error', body.message);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const now = Date.now();

      if (error.status === 401 || error.status === 403) {
        // Only show toast if user WAS logged in and not repeatedly on the login screen
        if (authService.isLoggedIn() && !isAuthRequest && now - lastUnauthorizedToastTime > 8000) {
          lastUnauthorizedToastTime = now;
          toastService.showError('Session Expired', 'Your session has expired. Please login again.');
        }
        if (!isAuthRequest) {
          authService.logout();
        }
      } else if (req.method !== 'GET' && !isAuthRequest) {
        const msg = error.error?.message || error.message || 'An unexpected server error occurred.';
        toastService.showError('Server Error', msg);
      }
      return throwError(() => error);
    })
  );
};
