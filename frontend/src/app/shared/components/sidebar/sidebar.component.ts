import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile topbar -->
    <div class="lg:hidden bg-slate-900 text-white h-14 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div class="flex items-center gap-2 font-bold">
        <span class="text-xl">🦐</span>
        <span class="text-cyan-400">Puerto</span><span>Criss</span>
      </div>
      <button
        (click)="mobileAbierto.set(!mobileAbierto())"
        class="w-9 h-9 flex flex-col items-center justify-center gap-1.5"
      >
        <span class="w-5 h-0.5 bg-white transition-all duration-200" [class]="mobileAbierto() ? 'rotate-45 translate-y-2' : ''"></span>
        <span class="w-5 h-0.5 bg-white transition-all duration-200" [class]="mobileAbierto() ? 'opacity-0' : ''"></span>
        <span class="w-5 h-0.5 bg-white transition-all duration-200" [class]="mobileAbierto() ? '-rotate-45 -translate-y-2' : ''"></span>
      </button>
    </div>

    <!-- Overlay mobile -->
    @if (mobileAbierto()) {
      <div
        class="lg:hidden fixed inset-0 bg-black/60 z-40"
        (click)="mobileAbierto.set(false)"
      ></div>
    }

    <!-- Sidebar desktop / drawer mobile -->
    <aside
      [class]="mobileAbierto() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed lg:static top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out"
    >
      <!-- Logo desktop -->
      <div class="hidden lg:flex p-6 border-b border-slate-700 items-center gap-3">
        <span class="text-2xl">🦐</span>
        <div>
          <p class="font-bold text-cyan-400">Puerto Criss</p>
          <p class="text-xs text-slate-400 capitalize">{{ auth.user()?.rol?.toLowerCase() }}</p>
        </div>
      </div>

      <!-- Espaciado mobile para el topbar -->
      <div class="lg:hidden h-14"></div>

      <!-- Nav -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400"
            (click)="mobileAbierto.set(false)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm text-slate-300"
          >
            <span class="text-lg">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Logout -->
      <div class="p-4 border-t border-slate-700">
        <button
          (click)="auth.logout()"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-sm"
        >
          <span class="text-lg">🚪</span> Cerrar sesión
        </button>
      </div>

    </aside>
  `,
})
export class SidebarComponent {
  auth = inject(AuthService);
  mobileAbierto = signal(false);

  navItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/pedidos', icon: '📋', label: 'Pedidos' },
    { path: '/admin/productos', icon: '🍽️', label: 'Productos' },
    { path: '/admin/clientes', icon: '👥', label: 'Clientes' },
    { path: '/admin/gastos', icon: '💸', label: 'Gastos' },
    { path: '/admin/caja', icon: '💰', label: 'Caja' },
    { path: '/admin/reportes', icon: '📈', label: 'Reportes' },
  ];
}
