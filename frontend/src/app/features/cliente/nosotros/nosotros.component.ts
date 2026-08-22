import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="bg-gradient-to-br from-slate-900 to-cyan-900 text-white px-4 py-10 text-center">
      <h1 class="text-3xl font-black mb-2">Sobre nosotros</h1>
      <p class="text-slate-400">Conocé nuestra historia</p>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-10 space-y-6">

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
        <div class="text-6xl mb-4">🦐</div>
        <h2 class="text-2xl font-black text-slate-900 mb-3">Puerto Criss</h2>
        <p class="text-slate-600 leading-relaxed">
          Somos una cevichería familiar con más de 10 años de experiencia trayendo el sabor del mar a tu mesa.
          Usamos ingredientes frescos del día para garantizar la mejor calidad en cada plato.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-3">
        @for (stat of stats; track stat.label) {
          <div class="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <p class="text-2xl font-black text-cyan-500">{{ stat.valor }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ stat.label }}</p>
          </div>
        }
      </div>

      <a routerLink="/menu"
        class="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-2xl transition-colors">
        🍽️ Ver nuestro menú
      </a>

    </div>
  `,
})
export class NosotrosComponent {
  stats = [
    { valor: '10+', label: 'Años de experiencia' },
    { valor: '8', label: 'Platos únicos' },
    { valor: '⭐⭐⭐⭐⭐', label: 'Calidad garantizada' },
  ];
}
