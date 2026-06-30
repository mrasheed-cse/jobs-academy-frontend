import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Used for the dictionary upload page. Matches the backend's actual
// IsTeacherOrAdmin permission (teacher, admin, or Django staff) rather
// than admin-only, so the frontend doesn't block users the backend
// would otherwise allow.
//
// Re-fetches the profile from the server instead of trusting cached
// localStorage alone - role is sensitive enough that a stale local copy
// shouldn't be the only check (e.g. if an admin's role was revoked,
// cached state would still show admin until next login otherwise).
export const dictionaryAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getAccessToken()) {
    return router.createUrlTree(['/login']);
  }

  return authService.fetchAndStoreCurrentUser().pipe(
    map((user) => {
      if (user && (user.role === 'admin' || user.role === 'teacher')) {
        return true;
      }
      return router.createUrlTree(['/language']);
    }),
    catchError(() => of(router.createUrlTree(['/language']))),
  );
};
