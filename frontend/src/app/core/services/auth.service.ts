import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User, Rol } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly rol = computed(() => this._user()?.rol ?? null);

  login(email: string, password: string) {
    return this.http
      .post<{ success: boolean; data: AuthResponse }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(({ data }) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          this._user.set(data.user);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  redirectByRole(rol: Rol) {
    const routes: Record<Rol, string> = {
      ADMIN: '/admin/dashboard',
      COCINA: '/cocina',
      MOZO: '/mozo/mesas',
    };
    this.router.navigate([routes[rol]]);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
