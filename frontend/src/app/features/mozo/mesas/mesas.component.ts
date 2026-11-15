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
    <div class="min-h-screen bg-slate-950 text-slate-100 pb-10">

      <!-- Header -->
      <header class="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-4 mb-6">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/25">
              🪑
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">Salón y Mesas</h1>
              <p class="text-slate-400 text-xs sm:text-sm">
                Mozo: <span class="text-cyan-400 font-semibold">{{ auth.user()?.nombre }}</span> · <span class="font-mono">{{ hora() }}</span>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-full border border-emerald-500/25 font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              En vivo
            </div>
            <button
              (click)="modalNuevaMesa.set(true)"
              class="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5"
            >
              <span>+</span> Nueva Mesa
            </button>
            <button
              (click)="cargar()"
              aria-label="Actualizar mesas"
              class="bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-colors shadow-md shadow-cyan-500/20"
            >
              🔄
            </button>
            <button
              (click)="auth.logout()"
              class="text-slate-400 hover:text-red-400 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <!-- Resumen y Filtros -->
      <div class="max-w-6xl mx-auto px-4 md:px-6 mb-6">
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            (click)="filtro.set('TODAS')"
            [class]="filtro() === 'TODAS' ? 'bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'"
            class="px-4 py-2 rounded-full text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0"
          >
            Todas <span>({{ mesas().length }})</span>
          </button>
          <button
            (click)="filtro.set('LIBRE')"
            [class]="filtro() === 'LIBRE' ? 'bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'"
            class="px-4 py-2 rounded-full text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Libres <span>({{ totalPorEstado('LIBRE') }})</span>
          </button>
          <button
            (click)="filtro.set('OCUPADA')"
            [class]="filtro() === 'OCUPADA' ? 'bg-orange-400 text-slate-950 font-black shadow-lg shadow-orange-500/20' : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'"
            class="px-4 py-2 rounded-full text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0"
          >
            <span class="w-2 h-2 rounded-full bg-orange-400"></span>
            Ocupadas <span>({{ totalPorEstado('OCUPADA') }})</span>
          </button>
          <button
            (click)="filtro.set('RESERVADA')"
            [class]="filtro() === 'RESERVADA' ? 'bg-purple-400 text-slate-950 font-black shadow-lg shadow-purple-500/20' : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'"
            class="px-4 py-2 rounded-full text-xs sm:text-sm transition-all flex items-center gap-2 flex-shrink-0"
          >
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            Reservadas <span>({{ totalPorEstado('RESERVADA') }})</span>
          </button>
        </div>
      </div>

      <!-- Grilla de Mesas -->
      <div class="max-w-6xl mx-auto px-4 md:px-6">
        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-slate-900/60 rounded-3xl h-48 animate-pulse border border-white/10"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (mesa of mesasFiltradas(); track mesa.id) {
              <div
                class="rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between bg-slate-900/90 hover:-translate-y-0.5"
                [ngClass]="{
                  'border-emerald-500/30 hover:border-emerald-400/60 shadow-xl shadow-emerald-950/20': mesa.estado === 'LIBRE',
                  'border-orange-500/40 hover:border-orange-400/70 shadow-xl shadow-orange-950/25': mesa.estado === 'OCUPADA',
                  'border-purple-500/40 hover:border-purple-400/70 shadow-xl shadow-purple-950/25': mesa.estado === 'RESERVADA'
                }"
              >
                <!-- Top card -->
                <div>
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="text-2xl font-black text-white tracking-tight">{{ mesa.numero }}</h3>
                      <p class="text-xs text-slate-400 mt-0.5">
                        @if (mesa.estado === 'LIBRE') { Disponible para clientes }
                        @else if (mesa.estado === 'OCUPADA') { En atención }
                        @else { Reserva programada }
                      </p>
                    </div>
                    <span
                      class="px-3 py-1 rounded-full text-[11px] font-black tracking-wide"
                      [ngClass]="{
                        'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30': mesa.estado === 'LIBRE',
                        'bg-orange-500/15 text-orange-300 border border-orange-500/30 animate-pulse': mesa.estado === 'OCUPADA',
                        'bg-purple-500/15 text-purple-300 border border-purple-500/30': mesa.estado === 'RESERVADA'
                      }"
                    >
                      {{ mesa.estado }}
                    </span>
                  </div>

                  <!-- Pedidos activos de la mesa -->
                  @if (getPedidoActivo(mesa.id); as pedido) {
                    <div class="bg-slate-950/80 rounded-2xl p-3.5 mb-4 border border-white/10 space-y-1.5">
                      <div class="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span class="font-mono text-cyan-300">Comanda #{{ pedido.id }}</span>
                        <app-badge-estado [estado]="pedido.estado" />
                      </div>
                      <p class="text-xs text-slate-400 truncate">
                        {{ pedido.detalles.length }} producto(s) · <span class="text-white font-bold">S/ {{ totalPedido(pedido) }}</span>
                      </p>
                    </div>
                  }
                </div>

                <!-- Acciones de la mesa -->
                <div class="pt-3.5 border-t border-white/10 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Estado rápido</span>
                    <button
                      (click)="abrirModalQR(mesa)"
                      class="text-xs bg-white/5 hover:bg-white/10 text-cyan-300 font-bold px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors"
                      title="Ver enlace QR de la mesa"
                    >
                      <span>📲</span> QR Mesa
                    </button>
                  </div>

                  <div class="flex items-center gap-2">
                    @if (mesa.estado !== 'LIBRE') {
                      <button
                        (click)="cambiarEstadoMesa(mesa, 'LIBRE')"
                        class="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-extrabold py-2.5 rounded-xl transition-colors text-center border border-emerald-500/30"
                      >
                        Libre
                      </button>
                    }
                    @if (mesa.estado !== 'OCUPADA') {
                      <button
                        (click)="cambiarEstadoMesa(mesa, 'OCUPADA')"
                        class="flex-1 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 text-xs font-extrabold py-2.5 rounded-xl transition-colors text-center border border-orange-500/30"
                      >
                        Ocupada
                      </button>
                    }
                    @if (mesa.estado !== 'RESERVADA') {
                      <button
                        (click)="cambiarEstadoMesa(mesa, 'RESERVADA')"
                        class="flex-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-extrabold py-2.5 rounded-xl transition-colors text-center border border-purple-500/30"
                      >
                        Reservada
                      </button>
                    }
                  </div>
                </div>

              </div>
            }
          </div>
        }
      </div>

    </div>

    <!-- Modal Enlace QR de Mesa -->
    @if (mesaQRSeleccionada()) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 text-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 text-center">
          <div class="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-cyan-500/30">
            📲
          </div>
          <div>
            <h2 class="text-xl font-black text-white">Mesa {{ mesaQRSeleccionada()!.numero }}</h2>
            <p class="text-slate-400 text-xs mt-1">Enlace directo para autopedido desde la mesa</p>
          </div>

          <div class="bg-slate-900 border border-slate-700 p-3 rounded-xl text-left">
            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1">Enlace del menú con mesa asignada:</label>
            <p class="font-mono text-xs text-cyan-300 break-all select-all">{{ getUrlMesa(mesaQRSeleccionada()!.numero) }}</p>
          </div>

          <div class="flex gap-2">
            <button
              (click)="copiarEnlaceMesa(mesaQRSeleccionada()!.numero)"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>{{ qrCopiado() ? '✅ Copiado' : '📋 Copiar Enlace' }}</span>
            </button>
            <button
              (click)="mesaQRSeleccionada.set(null)"
              class="border border-slate-700 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }

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

  mesaQRSeleccionada = signal<Mesa | null>(null);
  qrCopiado = signal(false);

  private sub = new Subscription();
  private reloj: any;

  ngOnInit() {
    this.socketService.unirseAStaff();
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

  abrirModalQR(mesa: Mesa) {
    this.mesaQRSeleccionada.set(mesa);
    this.qrCopiado.set(false);
  }

  getUrlMesa(numero: string): string {
    const origin = window.location.origin;
    return `${origin}/menu?mesa=${encodeURIComponent(numero)}`;
  }

  copiarEnlaceMesa(numero: string) {
    const url = this.getUrlMesa(numero);
    navigator.clipboard.writeText(url).then(() => {
      this.qrCopiado.set(true);
      setTimeout(() => this.qrCopiado.set(false), 2500);
    });
  }
}

