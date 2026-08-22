import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../../core/services/carrito.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { MesasService } from '../../../core/services/mesas.service';
import { TipoPedido, MetodoPago, Mesa } from '../../../core/models/models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-6 pb-10">

      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/menu" class="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
          <app-icon name="arrow-left" [size]="18" />
        </a>
        <h1 class="text-xl font-black text-slate-900">Mi pedido</h1>
      </div>

      @if (carrito.items().length === 0) {
        <div class="text-center py-24">
          <div class="flex justify-center mb-4 text-slate-200">
            <app-icon name="cart" [size]="64" />
          </div>
          <p class="text-xl font-bold text-slate-700 mb-2">Tu carrito está vacío</p>
          <p class="text-slate-400 text-sm mb-6">Agregá algo rico del menú</p>
          <a routerLink="/menu" class="bg-orange-500 text-white font-bold px-8 py-3 rounded-2xl inline-block hover:bg-orange-400 transition-colors">
            Ver menú
          </a>
        </div>
      }

      @if (carrito.items().length > 0) {

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 mb-5">
          @for (item of carrito.items(); track item.producto.id) {
            <div class="flex items-center gap-3 p-4">
              <div class="w-12 h-12 bg-gradient-to-br from-cyan-50 to-slate-100 rounded-xl flex items-center justify-center text-slate-300 flex-shrink-0">
                <app-icon name="utensils" [size]="22" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-800 text-sm truncate">{{ item.producto.nombre }}</p>
                <p class="text-cyan-600 font-bold text-sm">S/ {{ item.producto.precio_actual }}</p>
              </div>
              <div class="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
                <button
                  (click)="carrito.actualizar(item.producto.id, item.cantidad - 1)"
                  class="w-7 h-7 bg-white rounded-full text-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
                ><app-icon name="minus" [size]="14" /></button>
                <span class="font-black text-slate-800 w-4 text-center text-sm">{{ item.cantidad }}</span>
                <button
                  (click)="carrito.actualizar(item.producto.id, item.cantidad + 1)"
                  class="w-7 h-7 bg-orange-500 rounded-full text-white flex items-center justify-center shadow-sm hover:bg-orange-400 transition-colors"
                ><app-icon name="plus" [size]="14" /></button>
              </div>
              <p class="font-black text-slate-800 text-sm w-14 text-right">
                S/ {{ (item.producto.precio_actual * item.cantidad).toFixed(2) }}
              </p>
            </div>
          }
        </div>

        <!-- Tipo de entrega -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
          <p class="font-bold text-slate-800 mb-3">¿Cómo lo recibís?</p>
          <div class="grid grid-cols-3 gap-2">
            @for (op of tiposOpciones; track op.valor) {
              <button
                type="button"
                (click)="tipo = op.valor"
                [class]="tipo === op.valor ? 'border-2 border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-2 border-slate-200 text-slate-600 hover:border-slate-300'"
                class="rounded-xl py-3 text-sm font-semibold transition-all text-center"
              >
                <div class="flex justify-center mb-1 text-current"><app-icon [name]="op.icono" [size]="20" /></div>
                {{ op.label }}
              </button>
            }
          </div>

          <!-- Opciones extras para Mesa -->
          @if (tipo === 'MESA') {
            <div class="mt-4 pt-4 border-t border-slate-100">
              <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Selecciona tu mesa *</label>
              <select
                [(ngModel)]="mesaId"
                class="w-full border-2 border-slate-200 focus:border-cyan-400 rounded-xl px-4 py-3 focus:outline-none text-slate-800 transition-colors bg-white"
              >
                <option [ngValue]="null">-- Elige una mesa --</option>
                @for (m of mesas(); track m.id) {
                  <option [ngValue]="m.id">
                    {{ m.numero }} ({{ m.estado }})
                  </option>
                }
              </select>
            </div>
          }

          <!-- Opciones extras para Delivery -->
          @if (tipo === 'DELIVERY') {
            <div class="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Dirección de entrega *</label>
                <input
                  type="text"
                  [(ngModel)]="direccion"
                  placeholder="Av. Principal 123, Dpto 4B"
                  class="w-full border-2 border-slate-200 focus:border-cyan-400 rounded-xl px-4 py-3 focus:outline-none text-slate-800 transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Referencia (opcional)</label>
                <input
                  type="text"
                  [(ngModel)]="referencia"
                  placeholder="Frente al parque, portón blanco..."
                  class="w-full border-2 border-slate-200 focus:border-cyan-400 rounded-xl px-4 py-3 focus:outline-none text-slate-800 transition-colors"
                />
              </div>
            </div>
          }
        </div>

        <!-- Datos del cliente -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4 space-y-3">
          <p class="font-bold text-slate-800">Tus datos</p>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Nombre *</label>
            <input type="text" [(ngModel)]="nombre" placeholder="¿Cómo te llamás?"
              class="w-full border-2 border-slate-200 focus:border-cyan-400 rounded-xl px-4 py-3 focus:outline-none text-slate-800 transition-colors" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Teléfono / WhatsApp</label>
            <input type="tel" [(ngModel)]="telefono" placeholder="999 999 999"
              class="w-full border-2 border-slate-200 focus:border-cyan-400 rounded-xl px-4 py-3 focus:outline-none text-slate-800 transition-colors" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Notas para la cocina (opcional)</label>
            <textarea [(ngModel)]="notas" placeholder="Sin cebolla, ají aparte, extra limón..." rows="2"
              class="w-full border-2 border-slate-200 focus:border-cyan-400 rounded-xl px-4 py-3 focus:outline-none text-slate-800 transition-colors resize-none"></textarea>
          </div>
        </div>

        <!-- Método de pago -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
          <p class="font-bold text-slate-800 mb-3">¿Cómo vas a pagar?</p>
          <div class="grid grid-cols-3 gap-2">
            @for (op of pagosOpciones; track op.valor) {
              <button
                type="button"
                (click)="metodoPago = op.valor"
                [class]="metodoPago === op.valor ? 'border-2 border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-2 border-slate-200 text-slate-600 hover:border-slate-300'"
                class="rounded-xl py-3 text-sm font-semibold transition-all text-center"
              >
                <div class="text-xl mb-1">{{ op.icono }}</div>
                {{ op.label }}
              </button>
            }
          </div>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span> {{ error() }}
          </div>
        }

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div class="flex justify-between items-center mb-4">
            <span class="text-slate-600 font-medium">Total a pagar</span>
            <span class="text-3xl font-black text-slate-900">S/ {{ carrito.total().toFixed(2) }}</span>
          </div>
          <button
            (click)="confirmar()"
            [disabled]="loading()"
            class="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-colors text-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
          >
            @if (!loading()) { <app-icon name="check" [size]="20" /> }
            {{ loading() ? 'Enviando pedido...' : 'Confirmar pedido' }}
          </button>
        </div>

      }
    </div>
  `,
})
export class CarritoComponent implements OnInit {
  carrito = inject(CarritoService);
  private pedidosService = inject(PedidosService);
  private mesasService = inject(MesasService);
  private router = inject(Router);

  tipo: TipoPedido = 'RECOJO';
  metodoPago: MetodoPago = 'EFECTIVO';
  nombre = '';
  telefono = '';
  direccion = '';
  referencia = '';
  mesaId: number | null = null;
  notas = '';
  loading = signal(false);
  error = signal('');
  mesas = signal<Mesa[]>([]);

  tiposOpciones = [
    { valor: 'RECOJO' as TipoPedido, label: 'Recojo', icono: 'arrow-right' },
    { valor: 'DELIVERY' as TipoPedido, label: 'Delivery', icono: 'map-pin' },
    { valor: 'MESA' as TipoPedido, label: 'Mesa', icono: 'utensils' },
  ];

  pagosOpciones = [
    { valor: 'EFECTIVO' as MetodoPago, label: 'Efectivo', icono: '💵' },
    { valor: 'YAPE' as MetodoPago, label: 'Yape', icono: '📱' },
    { valor: 'TARJETA' as MetodoPago, label: 'Tarjeta', icono: '💳' },
  ];

  ngOnInit() {
    this.mesasService.getAll().subscribe({
      next: ({ data }) => this.mesas.set(data),
      error: () => {},
    });
  }

  confirmar() {
    if (!this.nombre.trim()) {
      this.error.set('Por favor ingresa tu nombre para continuar');
      return;
    }

    if (this.tipo === 'DELIVERY' && !this.direccion.trim()) {
      this.error.set('Por favor ingresa la dirección de entrega');
      return;
    }

    if (this.tipo === 'MESA' && !this.mesaId) {
      this.error.set('Por favor selecciona el número de mesa');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const body = {
      tipo: this.tipo,
      direccion: this.tipo === 'DELIVERY' ? this.direccion.trim() : null,
      referencia: this.tipo === 'DELIVERY' ? this.referencia.trim() : null,
      mesa_id: this.tipo === 'MESA' ? this.mesaId : null,
      notas: this.notas.trim(),
      cliente: {
        nombre: this.nombre.trim(),
        telefono: this.telefono.trim() || undefined,
      },
      detalles: this.carrito.items().map((i) => ({
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio_actual,
      })),
      metodo_pago: this.metodoPago,
    };

    this.pedidosService.crear(body).subscribe({
      next: ({ data }) => {
        this.carrito.limpiar();
        this.router.navigate(['/pedido', data.codigo || data.id]);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al enviar el pedido');
        this.loading.set(false);
      },
    });
  }
}
