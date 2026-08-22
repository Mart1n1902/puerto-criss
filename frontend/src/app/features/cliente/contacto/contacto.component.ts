import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <!-- Header -->
    <div class="bg-gradient-to-br from-slate-900 to-cyan-900 text-white px-4 py-10 text-center">
      <h1 class="text-3xl font-black mb-2">📍 Encuéntranos</h1>
      <p class="text-slate-400">Ven a visitarnos o hacé tu pedido en línea</p>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">

      <!-- Info de contacto -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">

        <a href="https://maps.app.goo.gl/kJ7CxhHT16JyuNsT9" target="_blank"
          class="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
          <div class="w-11 h-11 bg-red-100 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <app-icon name="map-pin" [size]="22" />
          </div>
          <div>
            <p class="font-bold text-slate-800">Dirección</p>
            <p class="text-slate-500 text-sm">Ver en Google Maps</p>
          </div>
        </a>

        <a href="https://wa.me/51999999999" target="_blank"
          class="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
          <div class="w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <app-icon name="whatsapp" [size]="22" />
          </div>
          <div>
            <p class="font-bold text-slate-800">WhatsApp</p>
            <p class="text-slate-500 text-sm">Escribinos para tu pedido</p>
          </div>
        </a>

        <div class="flex items-center gap-4 p-5">
          <div class="w-11 h-11 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <app-icon name="clock" [size]="22" />
          </div>
          <div>
            <p class="font-bold text-slate-800">Horario</p>
            <p class="text-slate-500 text-sm">Lunes a Domingo · 11:00 am – 6:00 pm</p>
          </div>
        </div>

      </div>

      <!-- Mapa embebido -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-4 border-b border-slate-100">
          <p class="font-bold text-slate-800">Cómo llegar</p>
        </div>
        <div class="relative w-full h-72">
          <iframe
            src="https://www.google.com/maps?q=-12.0052917,-77.0179711&z=17&output=embed"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="w-full h-full"
          ></iframe>
        </div>
        <div class="p-4">
          <a
            href="https://maps.app.goo.gl/kJ7CxhHT16JyuNsT9"
            target="_blank"
            class="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors"
          >
            🗺️ Abrir en Google Maps
          </a>
        </div>
      </div>

      <!-- CTA pedido -->
      <a routerLink="/menu"
        class="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-2xl transition-colors shadow-lg shadow-orange-200">
        🍽️ Hacer un pedido ahora
      </a>

    </div>
  `,
})
export class ContactoComponent {}
