import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User, Rol } from '../models/models';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private socketService = inject(SocketService);

  private _user = signal<User | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && this.hasValidToken());
  readonly rol = computed(() => this._user()?.rol ?? null);

  login(email: string, password: string) {
    return this.http
      .post<{ success: boolean; data: AuthResponse }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(({ data }) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          this._user.set(data.user);
          this.socketService.unirseAStaff();
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    this.socketService.salirDeStaff();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getHomeRoute(rol: Rol): string {
    const routes: Record<Rol, string> = {
      ADMIN: '/admin/dashboard',
      COCINA: '/cocina',
      MOZO: '/mozo/mesas',
    };
    return routes[rol] ?? '/';
  }

  redirectByRole(rol: Rol) {
    this.router.navigate([this.getHomeRoute(rol)]);
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private loadUser(): User | null {
    if (!this.hasValidToken()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
