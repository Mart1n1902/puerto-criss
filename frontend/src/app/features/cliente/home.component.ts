import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white min-h-[70vh] flex items-center px-4 py-16">
      <div class="max-w-2xl mx-auto text-center w-full">
        <div class="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-2 text-cyan-400 text-sm font-semibold mb-6">
          <span class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          Abierto ahora · Pedidos en línea
        </div>
        <h1 class="text-5xl md:text-6xl font-black mb-4 leading-tight">
          Puerto <span class="text-cyan-400">Criss</span> 🦐
        </h1>
        <p class="text-slate-300 text-lg mb-8 max-w-sm mx-auto leading-relaxed">
          El mejor ceviche de la ciudad. Fresco, sabroso y listo en minutos.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a routerLink="/menu"
            class="bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-black px-8 py-4 rounded-2xl text-lg transition-colors shadow-xl shadow-orange-500/30">
            🍽️ Pedir ahora
          </a>
          <a routerLink="/nosotros"
            class="border-2 border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-bold px-8 py-4 rounded-2xl text-lg transition-colors">
            📍 Cómo llegar
          </a>
        </div>

        <!-- Buscador rápido de pedido -->
        <div class="max-w-md mx-auto bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">¿Ya tienes un pedido activo?</p>
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="codigoPedido"
              (keyup.enter)="consultarPedido()"
              placeholder="Ingresa tu clave (ej: PC-7842)"
              class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono uppercase font-bold text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              (click)="consultarPedido()"
              class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Rastrear
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- Categorías -->
    <section class="max-w-2xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-black text-slate-900 mb-6 text-center">¿Qué se te antoja?</h2>
      <div class="grid grid-cols-2 gap-3">
        @for (cat of categorias; track cat.nombre) {
          <a routerLink="/menu"
            class="bg-white rounded-2xl p-5 text-center shadow-sm border border-slate-100 hover:shadow-md hover:border-cyan-200 active:scale-95 transition-all group">
            <div class="text-4xl mb-2">{{ cat.icono }}</div>
            <p class="font-bold text-slate-700 group-hover:text-cyan-600 transition-colors text-sm">{{ cat.nombre }}</p>
          </a>
        }
      </div>
    </section>

    <!-- Beneficios -->
    <section class="bg-slate-900 text-white py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-black text-center mb-8">¿Por qué elegirnos?</h2>
        <div class="grid grid-cols-1 gap-4">
          @for (item of beneficios; track item.titulo) {
            <div class="flex items-center gap-4 bg-slate-800 rounded-2xl p-4">
              <div class="text-4xl flex-shrink-0">{{ item.icono }}</div>
              <div>
                <h3 class="font-bold text-white">{{ item.titulo }}</h3>
                <p class="text-slate-400 text-sm">{{ item.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="bg-orange-500 py-12 px-4 text-center text-white">
      <h2 class="text-2xl font-black mb-2">¿Listo para pedir?</h2>
      <p class="text-orange-100 mb-6">Tu ceviche favorito a un click de distancia</p>
      <a routerLink="/menu"
        class="bg-white text-orange-500 font-black px-8 py-4 rounded-2xl inline-block hover:bg-orange-50 transition-colors shadow-lg">
        Ver el menú completo →
      </a>
    </section>
  `,
})
export class HomeComponent {
  private router = inject(Router);
  codigoPedido = '';

  categorias = [
    { nombre: 'Ceviches', icono: '🦐' },
    { nombre: 'Chicharrones', icono: '🍤' },
    { nombre: 'Chaufas', icono: '🍳' },
    { nombre: 'Causas', icono: '🥔' },
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
