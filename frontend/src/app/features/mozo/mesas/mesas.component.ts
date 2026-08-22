import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesasService } from '../../../core/services/mesas.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { SocketService } from '../../../core/services/socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Mesa, EstadoMesa, Pedido } from '../../../core/models/models';
import { BadgeEstadoComponent } from '../../../shared/components/badge-estado/badge-estado.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeEstadoComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">

      <!-- Header -->
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
            🪑
          </div>
          <div>
            <h1 class="text-2xl font-black text-white">Salón y Mesas — Puerto Criss</h1>
            <p class="text-slate-400 text-sm">
              Mozo: <span class="text-cyan-400 font-medium">{{ auth.user()?.nombre }}</span> · {{ hora() }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-xs text-green-400 bg-green-950/40 px-3 py-2 rounded-xl border border-green-800/40">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            En vivo
          </div>
          <button
            (click)="modalNuevaMesa.set(true)"
            class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>+</span> Nueva Mesa
          </button>
          <button
            (click)="cargar()"
            class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            🔄
          </button>
          <button
            (click)="auth.logout()"
            class="text-slate-400 hover:text-red-400 text-sm font-medium px-3 py-2 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      <!-- Resumen y Filtros -->
      <div class="max-w-6xl mx-auto mb-6">
        <div class="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            (click)="filtro.set('TODAS')"
            [class]="filtro() === 'TODAS' ? 'bg-cyan-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'"
            class="px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            Todas <span>({{ mesas().length }})</span>
          </button>
          <button
            (click)="filtro.set('LIBRE')"
            [class]="filtro() === 'LIBRE' ? 'bg-green-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'"
            class="px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-green-400"></span>
            Libres <span>({{ totalPorEstado('LIBRE') }})</span>
          </button>
          <button
            (click)="filtro.set('OCUPADA')"
            [class]="filtro() === 'OCUPADA' ? 'bg-orange-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'"
            class="px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-orange-400"></span>
            Ocupadas <span>({{ totalPorEstado('OCUPADA') }})</span>
          </button>
          <button
            (click)="filtro.set('RESERVADA')"
            [class]="filtro() === 'RESERVADA' ? 'bg-purple-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'"
            class="px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            Reservadas <span>({{ totalPorEstado('RESERVADA') }})</span>
          </button>
        </div>
      </div>

      <!-- Grilla de Mesas -->
      <div class="max-w-6xl mx-auto">
        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-slate-800/60 rounded-2xl h-44 animate-pulse border border-slate-700"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (mesa of mesasFiltradas(); track mesa.id) {
              <div
                class="rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between"
                [ngClass]="{
                  'bg-slate-800/90 border-green-500/30 hover:border-green-500/60 shadow-lg shadow-green-950/20': mesa.estado === 'LIBRE',
                  'bg-slate-800/90 border-orange-500/40 hover:border-orange-500/70 shadow-lg shadow-orange-950/30': mesa.estado === 'OCUPADA',
                  'bg-slate-800/90 border-purple-500/40 hover:border-purple-500/70 shadow-lg shadow-purple-950/30': mesa.estado === 'RESERVADA'
                }"
              >
                <!-- Top card -->
                <div>
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h3 class="text-xl font-black text-white">{{ mesa.numero }}</h3>
                      <p class="text-xs text-slate-400">
                        @if (mesa.estado === 'LIBRE') { Disponible para clientes }
                        @else if (mesa.estado === 'OCUPADA') { En atención }
                        @else { Reserva programada }
                      </p>
                    </div>
                    <span
                      class="px-3 py-1 rounded-full text-xs font-black tracking-wide"
                      [ngClass]="{
                        'bg-green-500/20 text-green-400 border border-green-500/30': mesa.estado === 'LIBRE',
                        'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse': mesa.estado === 'OCUPADA',
                        'bg-purple-500/20 text-purple-400 border border-purple-500/30': mesa.estado === 'RESERVADA'
                      }"
                    >
                      {{ mesa.estado }}
                    </span>
                  </div>

                  <!-- Pedidos activos de la mesa -->
                  @if (getPedidoActivo(mesa.id); as pedido) {
                    <div class="bg-slate-900/80 rounded-xl p-3 mb-4 border border-slate-700/60 space-y-1.5">
                      <div class="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Comanda #{{ pedido.id }}</span>
                        <app-badge-estado [estado]="pedido.estado" />
                      </div>
                      <p class="text-xs text-slate-400 truncate">
                        {{ pedido.detalles.length }} producto(s) · S/ {{ totalPedido(pedido) }}
                      </p>
                    </div>
                  }
                </div>

                <!-- Acciones de la mesa -->
                <div class="pt-3 border-t border-slate-700/50 flex items-center gap-2">
                  <span class="text-xs text-slate-400 font-medium mr-1">Cambiar a:</span>
                  @if (mesa.estado !== 'LIBRE') {
                    <button
                      (click)="cambiarEstadoMesa(mesa, 'LIBRE')"
                      class="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold py-2 rounded-xl transition-colors text-center border border-green-500/30"
                    >
                      Libre
                    </button>
                  }
                  @if (mesa.estado !== 'OCUPADA') {
                    <button
                      (click)="cambiarEstadoMesa(mesa, 'OCUPADA')"
                      class="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-bold py-2 rounded-xl transition-colors text-center border border-orange-500/30"
                    >
                      Ocupada
                    </button>
                  }
                  @if (mesa.estado !== 'RESERVADA') {
                    <button
                      (click)="cambiarEstadoMesa(mesa, 'RESERVADA')"
                      class="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-bold py-2 rounded-xl transition-colors text-center border border-purple-500/30"
                    >
                      Reservada
                    </button>
                  }
                </div>

              </div>
            }
          </div>
        }
      </div>

    </div>

    <!-- Modal Crear Mesa -->
    @if (modalNuevaMesa()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 text-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
          <h2 class="text-lg font-bold">Agregar Nueva Mesa</h2>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Nombre o Número de Mesa</label>
            <input
              type="text"
              [(ngModel)]="nuevaMesaNombre"
              placeholder="Ej: Mesa 6, Terraza 1, Barra..."
              class="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div class="flex gap-3 pt-2">
            <button
              (click)="modalNuevaMesa.set(false)"
              class="flex-1 border border-slate-600 text-slate-300 py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              (click)="crearMesa()"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MesasComponent implements OnInit, OnDestroy {
  private mesasService = inject(MesasService);
  private pedidosService = inject(PedidosService);
  private socketService = inject(SocketService);
  auth = inject(AuthService);

  mesas = signal<Mesa[]>([]);
  pedidosActivos = signal<Pedido[]>([]);
  filtro = signal<'TODAS' | EstadoMesa>('TODAS');
  loading = signal(true);
  hora = signal('');

  modalNuevaMesa = signal(false);
  nuevaMesaNombre = '';

  private sub = new Subscription();
  private reloj: any;

  ngOnInit() {
    this.cargar();

    // Sockets en vivo para mozos
    this.sub.add(
      this.socketService.nuevoPedido$.subscribe(() => {
        this.cargarPedidos();
      })
    );

    this.sub.add(
      this.socketService.cambioEstado$.subscribe(() => {
        this.cargarPedidos();
      })
    );

    this.reloj = setInterval(() => this.hora.set(new Date().toLocaleTimeString('es-PE')), 1000);
    this.hora.set(new Date().toLocaleTimeString('es-PE'));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    clearInterval(this.reloj);
  }

  cargar() {
    this.loading.set(true);
    this.mesasService.getAll().subscribe({
      next: ({ data }) => {
        this.mesas.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidosService.getAll({ tipo: 'MESA' }).subscribe({
      next: ({ data }) => {
        const activos = (data || []).filter(
          (p) => p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO'
        );
        this.pedidosActivos.set(activos);
      },
    });
  }

  mesasFiltradas(): Mesa[] {
    const f = this.filtro();
    if (f === 'TODAS') return this.mesas();
    return this.mesas().filter((m) => m.estado === f);
  }

  totalPorEstado(estado: EstadoMesa): number {
    return this.mesas().filter((m) => m.estado === estado).length;
  }

  getPedidoActivo(mesaId: number): Pedido | undefined {
    return this.pedidosActivos().find((p) => (p as any).mesa_id === mesaId || p.mesa?.id === mesaId);
  }

  totalPedido(pedido: Pedido): string {
    return (pedido.detalles || [])
      .reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0)
      .toFixed(2);
  }

  cambiarEstadoMesa(mesa: Mesa, nuevoEstado: EstadoMesa) {
    this.mesasService.update(mesa.id, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.mesas.update((list) =>
          list.map((m) => (m.id === mesa.id ? { ...m, estado: nuevoEstado } : m))
        );
      },
    });
  }

  crearMesa() {
    if (!this.nuevaMesaNombre.trim()) return;
    this.mesasService.create({ numero: this.nuevaMesaNombre.trim() }).subscribe({
      next: () => {
        this.nuevaMesaNombre = '';
        this.modalNuevaMesa.set(false);
        this.cargar();
      },
    });
  }
}
