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
      <footer class="bg-slate-950 text-slate-400 py-8 px-4 text-xs border-t border-white/10">
        <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-slate-300 font-bold">
            <span>🦐</span>
            <span>Puerto Criss — Cevichería &amp; Marisquería</span>
          </div>
          <p class="text-slate-500">© 2026 Todos los derechos reservados · Lima, Perú</p>
          <a routerLink="/login" class="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span>🔒</span> Acceso Personal
          </a>
        </div>
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {}
