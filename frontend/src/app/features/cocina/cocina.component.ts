import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { PedidosService } from '../../core/services/pedidos.service';
import { ProductosService } from '../../core/services/productos.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { Pedido, Producto } from '../../core/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cocina',
  standalone: true,
  template: `
    <div class="min-h-screen bg-slate-900 text-white p-4 md:p-6" (click)="habilitarAudio()">

      <!-- Alerta visual de nueva comanda -->
      @if (alertaNuevaComanda()) {
        <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-slate-900 px-6 py-3.5 rounded-2xl shadow-2xl font-black text-sm sm:text-base flex items-center gap-3 animate-bounce border-2 border-yellow-200">
          <span class="text-2xl animate-spin">🔔</span>
          <span>¡NUEVA COMANDA RECIBIDA EN VIVO!</span>
          <button (click)="alertaNuevaComanda.set(false)" class="text-xs bg-slate-900 text-white px-3 py-1 rounded-xl ml-2 font-bold hover:bg-slate-800">
            OK
          </button>
        </div>
      }

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl">👨‍🍳</span>
          <div>
            <h1 class="text-xl font-black">Cocina — Puerto Criss</h1>
            <p class="text-slate-400 text-xs sm:text-sm">{{ hora() }} · Tiempo Real activo</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- Botón de Control de Stock -->
          <button
            (click)="abrirModalStock()"
            class="text-xs bg-orange-500 hover:bg-orange-400 text-slate-900 font-black px-3.5 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5"
          >
            <span>🍽️</span> Stock / Platos del día
          </button>

          <!-- Botón de sonido interactivo -->
          <button
            (click)="probarYActivarSonido()"
            [class]="sonidoHabilitado() ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 animate-pulse'"
            class="text-xs font-bold border px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>{{ sonidoHabilitado() ? '🔔 Timbre Activo' : '🔊 Activar Timbre' }}</span>
          </button>

          <button
            (click)="cargar()"
            class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl transition-colors font-semibold"
          >
            🔄
          </button>

          <div class="flex items-center gap-1.5 text-xs text-green-400 bg-green-950/40 px-3 py-2 rounded-xl border border-green-800/40">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            WebSockets
          </div>

          <button
            (click)="auth.logout()"
            class="text-slate-400 hover:text-red-400 transition-colors text-xs font-semibold px-2 py-2"
          >
            Salir
          </button>
        </div>
      </div>

      <!-- Aviso si el sonido no ha sido desbloqueado -->
      @if (!sonidoHabilitado()) {
        <div (click)="probarYActivarSonido()" class="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs rounded-2xl p-3.5 mb-6 flex items-center justify-between cursor-pointer hover:bg-yellow-500/20 transition-colors">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">⚠️</span>
            <p><strong>Haz click aquí</strong> para activar las alertas sonoras de nuevas comandas en este navegador.</p>
          </div>
          <span class="bg-yellow-400 text-slate-900 font-bold px-3 py-1 rounded-xl text-xs">Activar timbre</span>
        </div>
      }

      <!-- Columnas de Comandas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- PENDIENTES -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
              <h2 class="font-bold text-lg">Pendientes de Cocinar</h2>
            </div>
            <span class="bg-yellow-400/20 text-yellow-400 text-xs font-black px-2.5 py-1 rounded-full border border-yellow-400/30">
              {{ pendientes().length }}
            </span>
          </div>

          <div class="space-y-3">
            @for (pedido of pendientes(); track pedido.id) {
              <div class="bg-slate-800 rounded-2xl p-4 border-2 border-yellow-400/40 shadow-lg space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-xl text-yellow-400">#{{ pedido.id }}</span>
                    @if (pedido.codigo) {
                      <span class="font-mono text-xs font-bold text-slate-300 bg-slate-700 px-2 py-0.5 rounded-md">{{ pedido.codigo }}</span>
                    }
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">{{ pedido.tipo }}</span>
                  </div>
                  <span class="text-slate-400 text-xs font-semibold bg-slate-900 px-2 py-1 rounded-md">{{ tiempoTranscurrido(pedido.createdAt) }}</span>
                </div>

                @if (pedido.cliente) {
                  <p class="text-slate-200 text-sm font-semibold">👤 {{ pedido.cliente.nombre }}</p>
                }
                @if (pedido.mesa) {
                  <p class="text-cyan-400 text-sm font-black">🪑 Mesa: {{ pedido.mesa.numero }}</p>
                }
                @if (pedido.direccion) {
                  <p class="text-slate-300 text-xs">📍 {{ pedido.direccion }} {{ pedido.referencia ? '(' + pedido.referencia + ')' : '' }}</p>
                }

                <ul class="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                  @for (item of pedido.detalles; track item.producto_id) {
                    <li class="flex items-center gap-2.5 text-sm">
                      <span class="bg-yellow-400 text-slate-900 font-black w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-sm">
                        {{ item.cantidad }}
                      </span>
                      <span class="text-white font-bold">{{ item.producto.nombre }}</span>
                    </li>
                  }
                </ul>

                @if (pedido.notas) {
                  <p class="text-yellow-300 text-xs bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-2.5 font-medium">
                    📝 <strong>Notas:</strong> {{ pedido.notas }}
                  </p>
                }

                <button
                  (click)="cambiarEstado(pedido.id, 'PREPARANDO')"
                  class="w-full bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-blue-500/30 text-sm flex items-center justify-center gap-2"
                >
                  <span>👨‍🍳</span> Empezar a preparar
                </button>
              </div>
            }
            @if (pendientes().length === 0) {
              <div class="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-500">
                <p class="text-4xl mb-2">✅</p>
                <p class="font-bold text-slate-400">Sin pedidos pendientes</p>
                <p class="text-xs mt-1">Los nuevos pedidos entrarán en tiempo real</p>
              </div>
            }
          </div>
        </div>

        <!-- PREPARANDO -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
              <h2 class="font-bold text-lg">En Preparación</h2>
            </div>
            <span class="bg-blue-400/20 text-blue-400 text-xs font-black px-2.5 py-1 rounded-full border border-blue-400/30">
              {{ preparando().length }}
            </span>
          </div>

          <div class="space-y-3">
            @for (pedido of preparando(); track pedido.id) {
              <div class="bg-slate-800 rounded-2xl p-4 border border-blue-500/40 shadow-lg shadow-blue-950/20 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-xl text-blue-400">#{{ pedido.id }}</span>
                    @if (pedido.codigo) {
                      <span class="font-mono text-xs font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-800">{{ pedido.codigo }}</span>
                    }
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-300">{{ pedido.tipo }}</span>
                  </div>
                  <span class="text-slate-400 text-xs font-semibold bg-slate-900 px-2 py-1 rounded-md">{{ tiempoTranscurrido(pedido.createdAt) }}</span>
                </div>

                @if (pedido.cliente) {
                  <p class="text-slate-200 text-sm font-semibold">👤 {{ pedido.cliente.nombre }}</p>
                }
                @if (pedido.mesa) {
                  <p class="text-cyan-400 text-sm font-black">🪑 Mesa: {{ pedido.mesa.numero }}</p>
                }
                @if (pedido.direccion) {
                  <p class="text-slate-300 text-xs">📍 {{ pedido.direccion }}</p>
                }

                <ul class="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                  @for (item of pedido.detalles; track item.producto_id) {
                    <li class="flex items-center gap-2.5 text-sm">
                      <span class="bg-blue-500/30 text-blue-300 font-black w-6 h-6 rounded-lg flex items-center justify-center text-xs">
                        {{ item.cantidad }}
                      </span>
                      <span class="text-white font-bold">{{ item.producto.nombre }}</span>
                    </li>
                  }
                </ul>

                @if (pedido.notas) {
                  <p class="text-yellow-300 text-xs bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-2.5 font-medium">
                    📝 <strong>Notas:</strong> {{ pedido.notas }}
                  </p>
                }

                <button
                  (click)="cambiarEstado(pedido.id, 'LISTO')"
                  class="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-green-500/30 text-sm flex items-center justify-center gap-2"
                >
                  <span>✅</span> ¡Plato listo para entregar!
                </button>
              </div>
            }
            @if (preparando().length === 0) {
              <div class="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-500">
                <p class="text-4xl mb-2">🍳</p>
                <p class="font-bold text-slate-400">Nada en preparación</p>
                <p class="text-xs mt-1">Inicia la preparación de los pedidos pendientes</p>
              </div>
            }
          </div>
        </div>

      </div>

    </div>

    <!-- Modal Control de Stock / Platos Agotados -->
    @if (modalStock()) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 text-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <div class="p-5 border-b border-slate-700 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">🍽️</span>
              <div>
                <h2 class="font-black text-lg">Disponibilidad de Platos</h2>
                <p class="text-xs text-slate-400">Apaga los platos que se quedaron sin insumos</p>
              </div>
            </div>
            <button (click)="modalStock.set(false)" class="w-8 h-8 rounded-full bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center">✕</button>
          </div>

          <div class="p-5 overflow-y-auto flex-1 space-y-3">
            @for (prod of listaProductos(); track prod.id) {
              <div class="flex items-center justify-between p-3.5 bg-slate-900/70 border border-slate-700 rounded-2xl">
                <div>
                  <p class="font-bold text-sm text-slate-100">{{ prod.nombre }}</p>
                  <p class="text-xs text-slate-400">S/ {{ prod.precio_actual }} · {{ prod.categoria?.nombre || 'Plato' }}</p>
                </div>
                <button
                  (click)="toggleDisponibilidad(prod)"
                  [class]="prod.disponible ? 'bg-green-500 hover:bg-green-400 text-slate-900' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'"
                  class="text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  {{ prod.disponible ? '🟢 Disponible' : '🚫 Agotado' }}
                </button>
              </div>
            }
          </div>

          <div class="p-4 border-t border-slate-700 bg-slate-900/60 text-center">
            <button (click)="modalStock.set(false)" class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-xs">
              Listo, cerrar panel
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CocinaComponent implements OnInit, OnDestroy {
  private pedidosService = inject(PedidosService);
  private productosService = inject(ProductosService);
  private socketService = inject(SocketService);
  auth = inject(AuthService);

  pendientes = signal<Pedido[]>([]);
  preparando = signal<Pedido[]>([]);
  hora = signal('');
  sonidoHabilitado = signal(false);
  alertaNuevaComanda = signal(false);
  modalStock = signal(false);
  listaProductos = signal<Producto[]>([]);

  private subs = new Subscription();
  private audioCtx: any = null;
  private reloj: any;

  ngOnInit() {
    this.cargar();
    this.cargarProductos();

    // Escuchar WebSocket en tiempo real
    this.subs.add(
      this.socketService.nuevoPedido$.subscribe((nuevoPedido) => {
        if (nuevoPedido.estado === 'PENDIENTE') {
          // Prevenir duplicados
          const listaActual = this.pendientes();
          if (!listaActual.some((p) => p.id === nuevoPedido.id)) {
            this.pendientes.set([nuevoPedido, ...listaActual]);
            this.alertaNuevaComanda.set(true);
            this.reproducirSonido();
            setTimeout(() => this.alertaNuevaComanda.set(false), 8000);
          }
        }
      })
    );

    this.subs.add(
      this.socketService.cambioEstado$.subscribe((pedidoActualizado) => {
        this.actualizarPedidoEnListas(pedidoActualizado);
      })
    );

    this.subs.add(
      this.socketService.productoActualizado$.subscribe((prodActualizado) => {
        this.listaProductos.update((lista) =>
          lista.map((p) => (p.id === prodActualizado.id ? { ...p, disponible: prodActualizado.disponible } : p))
        );
      })
    );

    this.reloj = setInterval(() => this.hora.set(new Date().toLocaleTimeString('es-PE')), 1000);
    this.hora.set(new Date().toLocaleTimeString('es-PE'));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    clearInterval(this.reloj);
  }

  habilitarAudio() {
    if (!this.audioCtx) {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.audioCtx = new AudioClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.sonidoHabilitado.set(true);
  }

  probarYActivarSonido() {
    this.habilitarAudio();
    this.reproducirSonido();
  }

  cargar() {
    this.pedidosService.getAll({ estado: 'PENDIENTE' }).subscribe({
      next: ({ data }) => this.pendientes.set(data || []),
    });

    this.pedidosService.getAll({ estado: 'PREPARANDO' }).subscribe({
      next: ({ data }) => this.preparando.set(data || []),
    });
  }

  cargarProductos() {
    this.productosService.getProductos(false).subscribe({
      next: ({ data }) => this.listaProductos.set(data || []),
    });
  }

  abrirModalStock() {
    this.cargarProductos();
    this.modalStock.set(true);
  }

  toggleDisponibilidad(prod: Producto) {
    this.productosService.toggleDisponible(prod.id).subscribe({
      next: ({ data }) => {
        this.listaProductos.update((list) =>
          list.map((p) => (p.id === prod.id ? { ...p, disponible: data.disponible } : p))
        );
      },
    });
  }

  actualizarPedidoEnListas(p: Pedido) {
    if (p.estado === 'PENDIENTE') {
      this.pendientes.update((list) => {
        const idx = list.findIndex((item) => item.id === p.id);
        return idx >= 0 ? list.map((item) => (item.id === p.id ? p : item)) : [p, ...list];
      });
      this.preparando.update((list) => list.filter((item) => item.id !== p.id));
    } else if (p.estado === 'PREPARANDO') {
      this.pendientes.update((list) => list.filter((item) => item.id !== p.id));
      this.preparando.update((list) => {
        const idx = list.findIndex((item) => item.id === p.id);
        return idx >= 0 ? list.map((item) => (item.id === p.id ? p : item)) : [p, ...list];
      });
    } else {
      // LISTO, ENTREGADO o CANCELADO
      this.pendientes.update((list) => list.filter((item) => item.id !== p.id));
      this.preparando.update((list) => list.filter((item) => item.id !== p.id));
    }
  }

  cambiarEstado(id: number, estado: string) {
    this.pedidosService.cambiarEstado(id, estado).subscribe({
      next: ({ data }) => this.actualizarPedidoEnListas(data),
    });
  }

  tiempoTranscurrido(fecha: string): string {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff === 1) return '1 min';
    return `${diff} min`;
  }

  reproducirSonido() {
    try {
      this.habilitarAudio();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const ahora = ctx.currentTime;

      // Tono 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, ahora); // E5
      gain1.gain.setValueAtTime(0.4, ahora);
      gain1.gain.exponentialRampToValueAtTime(0.001, ahora + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ahora);
      osc1.stop(ahora + 0.25);

      // Tono 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, ahora + 0.18); // B5
      gain2.gain.setValueAtTime(0.5, ahora + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, ahora + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ahora + 0.18);
      osc2.stop(ahora + 0.65);
    } catch {
      // Ignorar si el navegador bloquea audio
    }
  }
}
