import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-8">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl mb-3 shadow-lg shadow-cyan-500/20">
            <span class="text-3xl">🦐</span>
          </div>
          <h1 class="text-3xl font-black text-white">Puerto Criss</h1>
          <p class="text-slate-400 text-xs sm:text-sm mt-1">Acceso para Personal y Administrador</p>
        </div>

        <!-- Card -->
        <div class="bg-slate-800 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h2 class="text-xl font-bold text-white">Iniciar sesión</h2>
            <p class="text-xs text-slate-400 mt-0.5">Ingresa tus credenciales para acceder</p>
          </div>

          <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-4">

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Correo electrónico</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                placeholder="admin@puertocris.com"
                class="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Contraseña</label>
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                placeholder="••••••••"
                class="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-500 transition-all"
              />
            </div>

            @if (error()) {
              <p class="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{{ error() }}</p>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-50 text-slate-900 font-black rounded-2xl py-3.5 transition-all shadow-lg shadow-cyan-500/20 text-sm"
            >
              {{ loading() ? 'Ingresando...' : 'Ingresar al sistema' }}
            </button>

          </form>

          <!-- Acceso rápido de prueba -->
          <div class="pt-4 border-t border-slate-700/60">
            <p class="text-xs text-slate-400 mb-2 font-medium text-center">Acceso rápido para probar:</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                (click)="llenarCredenciales('admin@puertocris.com', 'admin123')"
                class="text-[11px] bg-slate-900 hover:bg-slate-700 text-cyan-300 border border-slate-700 p-2 rounded-xl text-center font-bold transition-colors"
              >
                👑 Admin
              </button>
              <button
                type="button"
                (click)="llenarCredenciales('cocina@puertocris.com', 'admin123')"
                class="text-[11px] bg-slate-900 hover:bg-slate-700 text-orange-300 border border-slate-700 p-2 rounded-xl text-center font-bold transition-colors"
              >
                👨‍🍳 Cocina
              </button>
              <button
                type="button"
                (click)="llenarCredenciales('mozo@puertocris.com', 'admin123')"
                class="text-[11px] bg-slate-900 hover:bg-slate-700 text-green-300 border border-slate-700 p-2 rounded-xl text-center font-bold transition-colors"
              >
                🧑‍💼 Mozo
              </button>
            </div>
          </div>

        </div>

        <p class="text-center text-slate-500 text-xs sm:text-sm mt-6">
          <a routerLink="/" class="hover:text-cyan-400 transition-colors font-medium">← Volver a la web del restaurante</a>
        </p>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  llenarCredenciales(correo: string, pass: string) {
    this.email = correo;
    this.password = pass;
  }

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: ({ data }) => this.auth.redirectByRole(data.user.rol),
      error: (err) => {
        this.error.set(err.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      },
    });
  }
}
