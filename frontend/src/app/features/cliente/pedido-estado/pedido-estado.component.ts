import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PedidosService } from '../../../core/services/pedidos.service';
import { SocketService } from '../../../core/services/socket.service';
import { Pedido, EstadoPedido } from '../../../core/models/models';
import { BadgeEstadoComponent } from '../../../shared/components/badge-estado/badge-estado.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pedido-estado',
  standalone: true,
  imports: [BadgeEstadoComponent],
  template: `
    <div class="max-w-lg mx-auto px-4 py-10">

      @if (loading()) {
        <div class="text-center py-20 text-slate-400">
          <p class="text-5xl mb-4 animate-spin">⏳</p>
          <p>Cargando tu pedido...</p>
        </div>
      }

      @if (!loading() && pedido()) {
        <!-- Header -->
        <div class="text-center mb-6">
          <p class="text-slate-500 text-sm mb-1">
            Pedido #{{ pedido()!.id }}
          </p>
          <h1 class="text-3xl font-black text-slate-900 mb-3">
            {{ iconoEstado[pedido()!.estado] }} {{ labelEstado[pedido()!.estado] }}
          </h1>
          <app-badge-estado [estado]="pedido()!.estado" />
        </div>

        <!-- Banner de Código de Seguimiento -->
        @if (pedido()!.codigo) {
          <div class="bg-gradient-to-br from-cyan-500/10 via-cyan-50 to-white border-2 border-cyan-200 rounded-2xl p-4 mb-6 text-center">
            <p class="text-xs uppercase font-bold tracking-wider text-cyan-800 mb-1">Tu clave única de seguimiento</p>
            <div class="flex items-center justify-center gap-3">
              <span class="text-3xl font-black text-slate-900 tracking-wider font-mono">{{ pedido()!.codigo }}</span>
              <button
                (click)="copiarCodigo()"
                class="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
              >
                {{ copiado() ? '✅ Copiado' : '📋 Copiar' }}
              </button>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Guarda este código para consultar el estado de tu pedido cuando quieras</p>
          </div>
        }

        <!-- Progreso -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div class="flex items-center justify-between">
            @for (paso of pasos; track paso.estado; let last = $last) {
              <div class="flex flex-col items-center flex-1">
                <div [class]="pasoActivo(paso.estado) ? 'bg-cyan-500 text-white scale-110 shadow-md shadow-cyan-300' : 'bg-slate-100 text-slate-400'"
                  class="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300">
                  {{ paso.icono }}
                </div>
                <p class="text-xs mt-1.5 text-slate-500 text-center font-medium">{{ paso.label }}</p>
              </div>
              @if (!last) {
                <div class="flex-1 h-0.5 bg-slate-200 mb-4 transition-colors"></div>
              }
            }
          </div>
        </div>

        <!-- Detalle -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 mb-6">
          <div class="p-4 bg-slate-50 rounded-t-2xl text-xs text-slate-500 space-y-1">
            <p><strong class="text-slate-700">Tipo:</strong> {{ pedido()!.tipo }}</p>
            @if (pedido()!.mesa) {
              <p><strong class="text-slate-700">Mesa:</strong> {{ pedido()!.mesa!.numero }}</p>
            }
            @if (pedido()!.direccion) {
              <p><strong class="text-slate-700">Dirección:</strong> {{ pedido()!.direccion }}</p>
            }
            @if (pedido()!.referencia) {
              <p><strong class="text-slate-700">Referencia:</strong> {{ pedido()!.referencia }}</p>
            }
            @if (pedido()!.notas) {
              <p><strong class="text-slate-700">Notas:</strong> {{ pedido()!.notas }}</p>
            }
          </div>
          @for (item of pedido()!.detalles; track item.producto_id) {
            <div class="flex justify-between items-center px-5 py-3">
              <span class="text-slate-700">{{ item.cantidad }}x {{ item.producto.nombre }}</span>
              <span class="font-medium text-slate-800">S/ {{ (item.cantidad * item.precio_unitario).toFixed(2) }}</span>
            </div>
          }
          <div class="flex justify-between items-center px-5 py-4 font-bold text-slate-900">
            <span>Total</span>
            <span>S/ {{ total().toFixed(2) }}</span>
          </div>
        </div>

        <!-- WhatsApp -->
        <a
          [href]="whatsappLink()"
          target="_blank"
          class="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-green-500/20"
        >
          <span class="text-xl">📱</span> Compartir por WhatsApp
        </a>

        <div class="flex items-center justify-center gap-2 text-slate-400 text-xs mt-4">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span>Actualización en tiempo real activa</span>
        </div>
      }

      @if (!loading() && !pedido()) {
        <div class="text-center py-20 text-slate-400">
          <p class="text-5xl mb-4">❌</p>
          <p class="font-bold text-slate-700">No encontramos ese pedido</p>
          <p class="text-xs text-slate-400 mt-1">Verifica que el código ingresado sea correcto</p>
        </div>
      }

    </div>
  `,
})
export class PedidoEstadoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private pedidosService = inject(PedidosService);
  private socketService = inject(SocketService);

  pedido = signal<Pedido | null>(null);
  loading = signal(true);
  copiado = signal(false);
  private sub = new Subscription();
  private parametroActual = '';

  pasos: { estado: EstadoPedido; icono: string; label: string }[] = [
    { estado: 'PENDIENTE', icono: '📋', label: 'Recibido' },
    { estado: 'PREPARANDO', icono: '👨‍🍳', label: 'Preparando' },
    { estado: 'LISTO', icono: '✅', label: 'Listo' },
    { estado: 'ENTREGADO', icono: '🎉', label: 'Entregado' },
  ];

  iconoEstado: Record<EstadoPedido, string> = {
    PENDIENTE: '📋', PREPARANDO: '👨‍🍳', LISTO: '✅', ENTREGADO: '🎉', CANCELADO: '❌',
  };

  labelEstado: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pedido recibido',
    PREPARANDO: 'En preparación',
    LISTO: '¡Tu pedido está listo!',
    ENTREGADO: '¡Buen provecho!',
    CANCELADO: 'Pedido cancelado',
  };

  ngOnInit() {
    this.parametroActual = this.route.snapshot.paramMap.get('id')!;
    this.cargar(this.parametroActual);

    // Escuchar cambios de estado en vivo vía WebSocket
    this.sub.add(
      this.socketService.cambioEstado$.subscribe((pedidoActualizado) => {
        const ped = this.pedido();
        if (
          ped &&
          (pedidoActualizado.id === ped.id ||
           pedidoActualizado.codigo?.toUpperCase() === this.parametroActual.toUpperCase())
        ) {
          this.pedido.set(pedidoActualizado);
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  cargar(param: string | number) {
    this.pedidosService.getById(param).subscribe({
      next: ({ data }) => {
        this.pedido.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  copiarCodigo() {
    const cod = this.pedido()?.codigo;
    if (!cod) return;
    navigator.clipboard.writeText(cod).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
    });
  }

  pasoActivo(estado: EstadoPedido): boolean {
    const orden: EstadoPedido[] = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO'];
    const actual = orden.indexOf(this.pedido()?.estado as EstadoPedido);
    const paso = orden.indexOf(estado);
    return paso <= actual;
  }

  total(): number {
    return this.pedido()?.detalles.reduce(
      (sum, d) => sum + d.cantidad * d.precio_unitario, 0
    ) ?? 0;
  }

  whatsappLink(): string {
    const p = this.pedido();
    if (!p) return '#';
    const items = p.detalles.map((d) => `• ${d.cantidad}x ${d.producto.nombre}`).join('\n');
    let extra = `📦 Tipo: ${p.tipo}`;
    if (p.codigo) extra += `\n🔑 Clave de seguimiento: *${p.codigo}*`;
    if (p.mesa) extra += `\n🪑 Mesa: ${p.mesa.numero}`;
    if (p.direccion) extra += `\n📍 Dirección: ${p.direccion}${p.referencia ? ` (Ref: ${p.referencia})` : ''}`;
    if (p.notas) extra += `\n📝 Notas: ${p.notas}`;

    const msg = `🦐 *Pedido #${p.id} ${p.codigo ? `(${p.codigo})` : ''} - Puerto Criss*\n👤 ${p.cliente?.nombre || 'Cliente'}\n${extra}\n\n${items}\n\n💰 Total: S/ ${this.total().toFixed(2)}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }
}
