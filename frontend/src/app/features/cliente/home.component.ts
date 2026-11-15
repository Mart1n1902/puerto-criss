import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white pt-16 pb-24 px-4">
      <!-- Glow decorativo -->
      <div class="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl"></div>

      <div class="relative max-w-4xl mx-auto text-center animate-fade-up">
        <div class="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/25 rounded-full px-4 py-1.5 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm">
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Abierto ahora · Ceviche fresco al instante
        </div>

        <h1 class="text-4xl sm:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
          El sabor del mar, <br class="hidden sm:block" />
          <span class="bg-gradient-to-r from-cyan-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            preparado al momento
          </span>
        </h1>

        <p class="text-slate-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Pesca del día, limón recién exprimido y ají limo en su punto. Pide para tu mesa, recojo o delivery en segundos.
        </p>

        <div class="flex flex-col sm:flex-row gap-3.5 justify-center mb-10">
          <a routerLink="/menu"
            class="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black px-8 py-4 rounded-2xl text-base sm:text-lg transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0">
            🍽️ Ver Carta y Pedir
          </a>
          <a routerLink="/contacto"
            class="bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold px-8 py-4 rounded-2xl text-base sm:text-lg transition-all backdrop-blur-sm">
            📍 Cómo llegar
          </a>
        </div>

        <!-- Buscador rápido de pedido -->
        <div class="max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
          <p class="text-[11px] text-cyan-300 font-bold uppercase tracking-widest mb-2.5">¿Ya hiciste un pedido? Rastréalo aquí</p>
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="codigoPedido"
              (keyup.enter)="consultarPedido()"
              placeholder="Código (ej: PC-7842)"
              class="flex-1 bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono uppercase font-bold text-cyan-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              (click)="consultarPedido()"
              class="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-cyan-500/20"
            >
              Rastrear
            </button>
          </div>
        </div>
      </div>

      <!-- Ola inferior -->
      <div class="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 56" class="w-full h-8 sm:h-12 fill-slate-50" preserveAspectRatio="none">
          <path d="M0,32 C320,64 1120,0 1440,32 L1440,56 L0,56 Z"></path>
        </svg>
      </div>
    </section>

    <!-- Categorías -->
    <section class="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <div class="text-center mb-8">
        <p class="text-xs font-extrabold uppercase tracking-widest text-cyan-600 mb-1">Especialidades</p>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">¿Qué se te antoja hoy?</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (cat of categorias; track cat.nombre) {
          <a routerLink="/menu"
            class="bg-white rounded-3xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-200 hover:-translate-y-1 transition-all group">
            <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-orange-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              {{ cat.icono }}
            </div>
            <p class="font-extrabold text-slate-800 group-hover:text-cyan-700 transition-colors text-base">{{ cat.nombre }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ cat.sub }}</p>
          </a>
        }
      </div>
    </section>

    <!-- Beneficios -->
    <section class="bg-slate-950 text-white py-14 px-4">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-10">
          <p class="text-xs font-extrabold uppercase tracking-widest text-cyan-400 mb-1">Nuestra promesa</p>
          <h2 class="text-2xl sm:text-3xl font-black">¿Por qué elegir Puerto Criss?</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          @for (item of beneficios; track item.titulo) {
            <div class="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-colors">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-400/20 flex items-center justify-center text-2xl mb-4">
                {{ item.icono }}
              </div>
              <h3 class="font-extrabold text-white text-lg mb-1.5">{{ item.titulo }}</h3>
              <p class="text-slate-400 text-sm leading-relaxed">{{ item.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 py-14 px-4 text-center text-white">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl sm:text-3xl font-black mb-2">¿Listo para disfrutar?</h2>
        <p class="text-orange-100 mb-7 text-sm sm:text-base">Personaliza el nivel de picor y tu guarnición favorita en segundos.</p>
        <a routerLink="/menu"
          class="bg-white text-orange-600 font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2 hover:bg-orange-50 transition-all shadow-xl hover:-translate-y-0.5">
          Ver el menú completo →
        </a>
      </div>
    </section>
  `,
})
export class HomeComponent {
  private router = inject(Router);
  codigoPedido = '';

  categorias = [
    { nombre: 'Ceviches', icono: '🦐', sub: 'Frescos al limón' },
    { nombre: 'Chicharrones', icono: '🍤', sub: 'Crocantes y dorados' },
    { nombre: 'Chaufas', icono: '🍳', sub: 'Al wok con mariscos' },
    { nombre: 'Causas', icono: '🥔', sub: 'Suaves y acevichadas' },
  ];

  beneficios = [
    { icono: '🌊', titulo: 'Ingredientes frescos del día', desc: 'Pescado y mariscos directo del mercado cada mañana' },
    { icono: '⚡', titulo: 'Pedido rápido y fácil', desc: 'Hacé tu pedido en segundos desde tu celular' },
    { icono: '❤️', titulo: 'Receta familiar', desc: 'Más de 10 años de tradición en cada plato' },
  ];

  consultarPedido() {
    const cod = this.codigoPedido.trim();
    if (!cod) return;
    this.router.navigate(['/pedido', cod]);
  }
}
