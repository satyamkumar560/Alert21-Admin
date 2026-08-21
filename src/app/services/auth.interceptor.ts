import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    tap((event) => {
      // Check for 200 OK but with an expired token message in the JSON body
      if (event instanceof HttpResponse && event.body) {
        const body = event.body as any;
        if (
          body.success === false && 
          body.message && 
          (body.message.toLowerCase().includes('expired') || body.message.toLowerCase().includes('invalid token'))
        ) {
          toastService.showError('Session Expired', 'Your admin session has expired. Please login again.');
          authService.logout();
        } else if (body.success === false && body.message) {
          // General API Error handled gracefully
          toastService.showError('API Error', body.message);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Check for actual HTTP 401 Unauthorized or 403 Forbidden
      if (error.status === 401 || error.status === 403) {
        toastService.showError('Unauthorized', 'Your session has expired or is invalid.');
        authService.logout();
      } else {
        const msg = error.error?.message || error.message || 'An unexpected server error occurred.';
        toastService.showError('Server Error', msg);
      }
      return throwError(() => error);
    })
  );
};
