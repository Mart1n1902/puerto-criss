import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles: Rol[] = route.data['roles'] ?? [];
  const currentRol = auth.rol();

  if (!auth.isAuthenticated() || !currentRol) {
    return router.createUrlTree(['/login']);
  }

  if (roles.includes(currentRol)) return true;
  return router.createUrlTree([auth.getHomeRoute(currentRol)]);
};
