import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

// Endpoints that should never receive an Authorization header / never trigger a refresh loop.
const AUTH_EXEMPT_PATHS = ['/auth/login/', '/auth/signup/', '/auth/token/refresh/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const isExempt = AUTH_EXEMPT_PATHS.some((path) => req.url.includes(path));

  const accessToken = authService.getAccessToken();
  const authReq = isApiRequest && accessToken && !isExempt
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isApiRequest && !isExempt && authService.getRefreshToken()) {
        return authService.refreshAccessToken().pipe(
          switchMap((res) => {
            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` } });
            return next(retried);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
