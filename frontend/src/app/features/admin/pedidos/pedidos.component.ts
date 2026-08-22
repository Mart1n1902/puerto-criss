import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { PedidosService } from '../../../core/services/pedidos.service';
import { BadgeEstadoComponent } from '../../../shared/components/badge-estado/badge-estado.component';
import { Pedido, EstadoPedido } from '../../../core/models/models';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [FormsModule, BadgeEstadoComponent, DatePipe, SlicePipe],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Control de Pedidos</h1>
          <p class="text-slate-500 text-xs sm:text-sm">Gestiona y actualiza el estado de las órdenes del restaurante</p>
        </div>
        <span class="bg-cyan-100 text-cyan-800 text-xs font-bold px-3 py-1.5 rounded-full w-fit">
          {{ pedidos().length }} pedidos registrados
        </span>
      </div>

      <!-- Filtros horizontales scrolleables en mobile -->
      <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        @for (f of filtros; track f.valor) {
          <button
            (click)="filtroActivo.set(f.valor); cargar()"
            [class]="filtroActivo() === f.valor ? 'bg-cyan-500 text-slate-900 font-bold shadow-md shadow-cyan-200' : 'bg-white text-slate-600 border border-slate-200'"
            class="flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
          >
            {{ f.label }}
          </button>
        }
      </div>

      <!-- VISTA MOBILE (Tarjetas interactivas para celular) -->
      <div class="block md:hidden space-y-3">
        @if (loading()) {
          @for (i of [1,2,3]; track i) {
            <div class="bg-white rounded-2xl p-4 h-36 animate-pulse"></div>
          }
        }

        @for (pedido of pedidos(); track pedido.id) {
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-black text-slate-900 text-base">#{{ pedido.id }}</span>
                @if (pedido.codigo) {
                  <span class="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">{{ pedido.codigo }}</span>
                }
              </div>
              <span class="text-slate-400 text-xs font-medium">{{ pedido.createdAt | date:'HH:mm' }}</span>
            </div>

            <div>
              <p class="font-bold text-slate-800 text-sm flex items-center gap-2">
                👤 {{ pedido.cliente?.nombre || 'Cliente sin registrar' }}
                @if (pedido.mesa) {
                  <span class="text-xs bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-md">🪑 {{ pedido.mesa.numero }}</span>
                }
              </p>
              @if (pedido.direccion) {
                <p class="text-xs text-slate-500 mt-0.5">📍 {{ pedido.direccion }}</p>
              }
              <p class="text-xs text-slate-400 mt-1">
                📦 {{ pedido.tipo }} · {{ pedido.detalles.length }} plato(s)
              </p>
              <div class="mt-1 bg-slate-50 p-2 rounded-lg text-xs text-slate-700 font-medium">
                @for (d of pedido.detalles; track d.producto_id; let last = $last) {
                  <span>{{ d.cantidad }}x {{ d.producto.nombre }}{{ !last ? ', ' : '' }}</span>
                }
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p class="text-[10px] text-slate-400 uppercase font-bold">Total a cobrar</p>
                <p class="text-base font-black text-slate-900">S/ {{ totalPedido(pedido) }}</p>
              </div>

              <div class="flex items-center gap-2">
                <app-badge-estado [estado]="pedido.estado" />
                @if (pedido.estado !== 'ENTREGADO' && pedido.estado !== 'CANCELADO') {
                  <select
                    (change)="cambiarEstado(pedido.id, $any($event.target).value)"
                    class="text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="">Cambiar...</option>
                    @for (op of estadosOpciones; track op.valor) {
                      <option [value]="op.valor">{{ op.label }}</option>
                    }
                  </select>
                }
              </div>
            </div>
          </div>
        }

        @if (!loading() && pedidos().length === 0) {
          <div class="text-center py-12 bg-white rounded-2xl text-slate-400">
            <p class="text-3xl mb-1">📋</p>
            <p class="text-sm font-semibold">No hay pedidos con este filtro</p>
          </div>
        }
      </div>

      <!-- VISTA DESKTOP / TABLET (Tabla completa) -->
      <div class="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th class="px-5 py-3 text-left">#</th>
                <th class="px-5 py-3 text-left">Código</th>
                <th class="px-5 py-3 text-left">Cliente / Mesa</th>
                <th class="px-5 py-3 text-left">Tipo</th>
                <th class="px-5 py-3 text-left">Productos</th>
                <th class="px-5 py-3 text-left">Total</th>
                <th class="px-5 py-3 text-left">Estado</th>
                <th class="px-5 py-3 text-left">Hora</th>
                <th class="px-5 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    <td colspan="9" class="px-5 py-4">
                      <div class="h-4 bg-slate-100 rounded animate-pulse"></div>
                    </td>
                  </tr>
                }
              }
              @for (pedido of pedidos(); track pedido.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4 font-black text-slate-800">#{{ pedido.id }}</td>
                  <td class="px-5 py-4">
                    @if (pedido.codigo) {
                      <span class="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">{{ pedido.codigo }}</span>
                    } @else {
                      <span class="text-slate-400 text-xs">—</span>
                    }
                  </td>
                  <td class="px-5 py-4">
                    <p class="font-bold text-slate-800">{{ pedido.cliente?.nombre || '—' }}</p>
                    @if (pedido.mesa) {
                      <span class="text-xs text-cyan-600 font-semibold">🪑 Mesa {{ pedido.mesa.numero }}</span>
                    }
                  </td>
                  <td class="px-5 py-4">
                    <span class="bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-lg text-xs">{{ pedido.tipo }}</span>
                  </td>
                  <td class="px-5 py-4 text-slate-600 text-xs">
                    {{ pedido.detalles.map(d => d.producto.nombre).join(', ') | slice:0:35 }}...
                  </td>
                  <td class="px-5 py-4 font-black text-slate-900">S/ {{ totalPedido(pedido) }}</td>
                  <td class="px-5 py-4"><app-badge-estado [estado]="pedido.estado" /></td>
                  <td class="px-5 py-4 text-slate-400 text-xs">{{ pedido.createdAt | date:'HH:mm' }}</td>
                  <td class="px-5 py-4">
                    @if (pedido.estado !== 'ENTREGADO' && pedido.estado !== 'CANCELADO') {
                      <select
                        (change)="cambiarEstado(pedido.id, $any($event.target).value)"
                        class="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        <option value="">Cambiar</option>
                        @for (op of estadosOpciones; track op.valor) {
                          <option [value]="op.valor">{{ op.label }}</option>
                        }
                      </select>
                    }
                  </td>
                </tr>
              }
              @if (!loading() && pedidos().length === 0) {
                <tr>
                  <td colspan="9" class="text-center py-12 text-slate-400 font-medium">No hay pedidos registrados</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
})
export class PedidosComponent implements OnInit {
  private pedidosService = inject(PedidosService);

  pedidos = signal<Pedido[]>([]);
  loading = signal(true);
  filtroActivo = signal<string>('');

  filtros = [
    { label: 'Todos', valor: '' },
    { label: 'Pendientes', valor: 'PENDIENTE' },
    { label: 'Preparando', valor: 'PREPARANDO' },
    { label: 'Listos', valor: 'LISTO' },
    { label: 'Entregados', valor: 'ENTREGADO' },
  ];

  estadosOpciones = [
    { valor: 'PREPARANDO', label: '👨‍🍳 Preparando' },
    { valor: 'LISTO', label: '✅ Listo' },
    { valor: 'ENTREGADO', label: '🎉 Entregado' },
    { valor: 'CANCELADO', label: '❌ Cancelar' },
  ];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    const params: any = {};
    if (this.filtroActivo()) params['estado'] = this.filtroActivo();
    this.pedidosService.getAll(params).subscribe({
      next: ({ data }) => { this.pedidos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cambiarEstado(id: number, estado: string) {
    if (!estado) return;
    this.pedidosService.cambiarEstado(id, estado).subscribe({
      next: () => this.cargar(),
    });
  }

  totalPedido(pedido: Pedido): string {
    return pedido.detalles
      .reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0)
      .toFixed(2);
  }
}
