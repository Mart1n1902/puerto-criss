import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../../core/services/carrito.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, IconComponent],
  template: `
    <nav class="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">

        <a routerLink="/" class="flex items-center gap-2 font-black text-xl">
          <span class="text-2xl">🦐</span>
          <span class="text-cyan-400">Puerto</span><span>Criss</span>
        </a>

        <div class="hidden md:flex items-center gap-5 text-sm">
          <a routerLink="/menu" routerLinkActive="text-cyan-400 font-bold" class="hover:text-cyan-400 transition-colors font-medium">Menú</a>
          <button
            (click)="modalRastrear.set(true)"
            class="text-slate-300 hover:text-cyan-400 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>🔍</span> Rastrear pedido
          </button>
          <a routerLink="/nosotros" routerLinkActive="text-cyan-400 font-bold" class="hover:text-cyan-400 transition-colors font-medium">Nosotros</a>
          <a routerLink="/contacto" routerLinkActive="text-cyan-400 font-bold" class="hover:text-cyan-400 transition-colors font-medium">Contacto</a>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/carrito" class="relative bg-orange-500 hover:bg-orange-400 transition-colors rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-md shadow-orange-500/20">
            <app-icon name="cart" [size]="18" />
            <span class="hidden sm:inline">Carrito</span>
            @if (carrito.cantidad() > 0) {
              <span class="absolute -top-2 -right-2 bg-cyan-400 text-slate-900 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center shadow">
                {{ carrito.cantidad() }}
              </span>
            }
          </a>

          <button
            (click)="menuAbierto.set(!menuAbierto())"
            class="md:hidden w-9 h-9 flex items-center justify-center text-white"
          >
            @if (menuAbierto()) {
              <app-icon name="x" [size]="22" />
            } @else {
              <app-icon name="menu" [size]="22" />
            }
          </button>
        </div>

      </div>

      @if (menuAbierto()) {
        <div class="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-4 space-y-1">
          <a routerLink="/menu" (click)="menuAbierto.set(false)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium">
            <app-icon name="utensils" [size]="18" /> Menú
          </a>
          <button
            (click)="modalRastrear.set(true); menuAbierto.set(false)"
            class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium text-cyan-400"
          >
            <span>🔍</span> Rastrear mi pedido
          </button>
          <a routerLink="/nosotros" (click)="menuAbierto.set(false)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium">
            <app-icon name="star" [size]="18" /> Nosotros
          </a>
          <a routerLink="/contacto" (click)="menuAbierto.set(false)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium">
            <app-icon name="map-pin" [size]="18" /> Contacto
          </a>
        </div>
      }
    </nav>

    <!-- Modal Rastrear Pedido -->
    @if (modalRastrear()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 text-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
          <div class="text-center">
            <div class="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl">
              🔍
            </div>
            <h2 class="text-lg font-black text-white">Rastrear mi pedido</h2>
            <p class="text-xs text-slate-400 mt-1">Ingresa el código que te dimos al crear tu pedido (ej: PC-4A8K o #12)</p>
          </div>

          <div>
            <input
              type="text"
              [(ngModel)]="codigoBusqueda"
              (keyup.enter)="buscarPedido()"
              placeholder="Ej: PC-7842"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold uppercase tracking-wider text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              (click)="modalRastrear.set(false)"
              class="flex-1 border border-slate-700 text-slate-300 py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              (click)="buscarPedido()"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2.5 rounded-xl transition-colors text-sm shadow-md shadow-cyan-500/20"
            >
              Consultar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class NavbarComponent {
  carrito = inject(CarritoService);
  private router = inject(Router);

  menuAbierto = signal(false);
  modalRastrear = signal(false);
  codigoBusqueda = '';

  buscarPedido() {
    const cod = this.codigoBusqueda.trim();
    if (!cod) return;
    this.modalRastrear.set(false);
    this.codigoBusqueda = '';
    this.router.navigate(['/pedido', cod]);
  }
}
