import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <footer class="bg-slate-900 text-slate-400 text-center py-4 text-sm">
        © 2025 Puerto Criss — Todos los derechos reservados
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {}
