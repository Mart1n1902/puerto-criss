import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles: Rol[] = route.data['roles'];

  if (auth.isAuthenticated() && roles.includes(auth.rol()!)) return true;
  return router.createUrlTree(['/login']);
};
