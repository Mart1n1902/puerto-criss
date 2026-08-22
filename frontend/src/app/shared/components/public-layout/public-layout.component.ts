import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <footer class="bg-slate-900 text-slate-400 py-6 text-xs text-center border-t border-slate-800 flex flex-col items-center gap-2">
        <p>© 2026 Puerto Criss — Cevichería & Marisquería</p>
        <a routerLink="/login" class="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium">
          <span>🔒</span> Acceso de Personal / Admin
        </a>
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {}
