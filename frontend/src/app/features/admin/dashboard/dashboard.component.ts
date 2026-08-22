import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { BadgeEstadoComponent } from '../../../shared/components/badge-estado/badge-estado.component';
import { RouterLink } from '@angular/router';
import { CajaService } from '../../../core/services/caja.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, BadgeEstadoComponent, RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Header principal -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Panel Principal</h1>
          <p class="text-slate-500 text-sm capitalize">Resumen del negocio · {{ hoy }}</p>
        </div>

        <!-- Estado de Caja -->
        <div class="flex items-center gap-3">
          @if (sesionCaja()) {
            <div class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-3.5 py-1.5 rounded-xl text-sm font-medium">
              <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>Caja Abierta (S/ {{ sesionCaja().monto_inicial }})</span>
            </div>
            <button
              (click)="modalCerrar.set(true)"
              class="bg-red-500 hover:bg-red-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
              title="Cerrar el turno de caja"
            >
              🔒 Cerrar caja
            </button>
          } @else {
            <button
              (click)="modalAbrir.set(true)"
              class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-black px-4 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-200 flex items-center gap-2"
            >
              <span>💰</span> Iniciar día (Abrir caja)
            </button>
          }
        </div>
      </div>

      <!-- Guía Rápida para el Dueño -->
      <div class="bg-gradient-to-r from-slate-900 to-cyan-950 text-white rounded-2xl p-5 shadow-lg border border-cyan-900/50">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">💡</span>
            <div>
              <h2 class="font-bold text-base text-cyan-300">¿Cómo llevar el control de tu restaurante hoy?</h2>
              <p class="text-slate-300 text-xs mt-0.5">Sigue estos 3 sencillos pasos para no perder ni un sol:</p>
            </div>
          </div>
          <button
            (click)="mostrarGuia.set(!mostrarGuia())"
            class="text-xs text-cyan-400 hover:underline font-semibold"
          >
            {{ mostrarGuia() ? 'Ocultar guía ▲' : 'Ver guía paso a paso ▼' }}
          </button>
        </div>

        @if (mostrarGuia()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-cyan-800/40 text-xs">
            <div class="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
              <p class="font-bold text-cyan-400 mb-1">1️⃣ Inicia tu jornada</p>
              <p class="text-slate-300 leading-relaxed">
                Abre caja con tu <strong>sencillo</strong> (ej. S/ 50 o S/ 100). Las ventas que cobres se sumarán solas a tu favor.
              </p>
            </div>
            <div class="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
              <p class="font-bold text-orange-400 mb-1">2️⃣ Anota tus compras</p>
              <p class="text-slate-300 leading-relaxed">
                Si compras pescado, verduras, limón o gas durante el día, regístralo en la sección <strong>Gastos</strong>.
              </p>
            </div>
            <div class="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700">
              <p class="font-bold text-green-400 mb-1">3️⃣ Cuadra al cerrar</p>
              <p class="text-slate-300 leading-relaxed">
                Al terminar el turno dale a <strong>Cerrar caja</strong>. El sistema te dirá exactamente cuánto dinero debes tener en mano.
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Métricas Explicadas -->
      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-2xl h-32 animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (metrica of metricas(); track metrica.label) {
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl">{{ metrica.icono }}</span>
                  <span [class]="metrica.color" class="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Hoy
                  </span>
                </div>
                <p class="text-2xl font-black text-slate-900">{{ metrica.valor }}</p>
                <p class="text-sm font-bold text-slate-700 mt-0.5">{{ metrica.label }}</p>
              </div>
              <p class="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50">
                {{ metrica.explicacion }}
              </p>
            </div>
          }
        </div>
      }

      <!-- Contenido Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Pedidos recientes -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 class="font-bold text-slate-800">Pedidos de hoy</h2>
              <p class="text-xs text-slate-400">Últimas comandas registradas en el sistema</p>
            </div>
            <a routerLink="/admin/pedidos" class="text-cyan-600 text-xs font-bold hover:underline">Ver todos →</a>
          </div>
          <div class="divide-y divide-slate-100">
            @if (pedidos().length === 0) {
              <div class="text-center py-12 text-slate-400">
                <p class="text-3xl mb-1">📋</p>
                <p class="text-sm">Aún no hay pedidos registrados hoy</p>
              </div>
            }
            @for (pedido of pedidos().slice(0, 6); track pedido.id) {
              <div class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div>
                  <p class="font-bold text-slate-800 text-sm">
                    #{{ pedido.id }} — {{ pedido.cliente?.nombre || 'Cliente' }}
                    @if (pedido.mesa) {
                      <span class="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-md ml-2 font-semibold">
                        🪑 {{ pedido.mesa.numero }}
                      </span>
                    }
                  </p>
                  <p class="text-xs text-slate-400 mt-0.5">
                    {{ pedido.tipo }} · {{ pedido.detalles?.length || 0 }} plato(s)
                    @if (pedido.direccion) {
                      · 📍 {{ pedido.direccion }}
                    }
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-black text-slate-800 text-sm">
                    S/ {{ totalPedido(pedido) }}
                  </span>
                  <app-badge-estado [estado]="pedido.estado" />
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Top productos -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div class="p-5 border-b border-slate-100">
            <h2 class="font-bold text-slate-800">Platos más vendidos</h2>
            <p class="text-xs text-slate-400">Lo que más sale en el día</p>
          </div>
          <div class="p-5 space-y-4">
            @if (!dashboard()?.top_productos?.length) {
              <div class="text-center py-8 text-slate-400">
                <p class="text-3xl mb-1">🦐</p>
                <p class="text-xs">Los platos más pedidos aparecerán aquí</p>
              </div>
            }
            @for (item of dashboard()?.top_productos; track item.producto_id; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {{ i + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-700 truncate">{{ item.nombre }}</p>
                </div>
                <span class="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                  {{ item._sum.cantidad }} vendidos
                </span>
              </div>
            }
          </div>
        </div>

      </div>
    </div>

    <!-- Modal Abrir Caja -->
    @if (modalAbrir()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
          <div class="text-center">
            <div class="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-3xl shadow-inner">
              💰
            </div>
            <h2 class="text-xl font-black text-slate-800">Apertura de Caja</h2>
            <p class="text-xs text-slate-500 mt-1">
              Ingresa el dinero en efectivo que dejas en la gaveta como <strong>sencillo para dar vuelto</strong>.
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Monto inicial en soles (S/)
            </label>
            <input
              type="number"
              [(ngModel)]="montoInicialInput"
              placeholder="Ej: 50.00"
              step="1"
              min="0"
              class="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-center text-2xl font-black text-slate-800 focus:outline-none focus:border-cyan-500"
            />
            <div class="flex justify-center gap-2 mt-2">
              <button (click)="montoInicialInput = 30" class="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">+ S/30</button>
              <button (click)="montoInicialInput = 50" class="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">+ S/50</button>
              <button (click)="montoInicialInput = 100" class="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">+ S/100</button>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              (click)="modalAbrir.set(false)"
              class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              (click)="confirmarAbrirCaja()"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-3 rounded-2xl transition-all shadow-md shadow-cyan-200 text-sm"
            >
              Iniciar caja
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Cerrar Caja -->
    @if (modalCerrar()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 text-center">
          <div class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-3xl">
            🔒
          </div>
          <h2 class="text-xl font-black text-slate-800">¿Cerrar la caja del día?</h2>
          <p class="text-xs text-slate-500 leading-relaxed">
            Se calculará el dinero final sumando tu <strong>sencillo inicial (S/ {{ sesionCaja()?.monto_inicial }})</strong> más las ventas cobradas menos los gastos registrados.
          </p>

          <div class="bg-slate-50 p-3 rounded-xl text-left text-xs text-slate-600 space-y-1">
            <p>📌 <strong>Recomendación:</strong> Cuenta tus billetes y monedas antes de confirmar para verificar que cuadre.</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              (click)="modalCerrar.set(false)"
              class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors text-sm"
            >
              Seguir vendiendo
            </button>
            <button
              (click)="confirmarCerrarCaja()"
              class="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-3 rounded-2xl transition-all shadow-md shadow-red-200 text-sm"
            >
              Sí, cerrar turno
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private pedidosService = inject(PedidosService);
  private cajaService = inject(CajaService);

  dashboard = signal<any>(null);
  pedidos = signal<any[]>([]);
  sesionCaja = signal<any>(null);
  loading = signal(true);
  mostrarGuia = signal(true);
  modalAbrir = signal(false);
  modalCerrar = signal(false);
  montoInicialInput = 50;

  hoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  metricas = signal<any[]>([]);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);

    this.cajaService.getSesionActiva().subscribe({
      next: ({ data }) => this.sesionCaja.set(data),
      error: () => this.sesionCaja.set(null),
    });

    this.reportesService.getDashboard().subscribe({
      next: ({ data }) => {
        this.dashboard.set(data);
        this.metricas.set([
          {
            label: 'Total Vendido',
            valor: `S/ ${data.ventas.toFixed(2)}`,
            icono: '💰',
            color: 'bg-green-100 text-green-700',
            explicacion: 'Dinero total generado por los pedidos entregados hoy.',
          },
          {
            label: 'Total Gastado',
            valor: `S/ ${data.gastos.toFixed(2)}`,
            icono: '💸',
            color: 'bg-red-100 text-red-700',
            explicacion: 'Compras de insumos, mercado o pagos del día.',
          },
          {
            label: 'Ganancia del Día',
            valor: `S/ ${data.ganancia.toFixed(2)}`,
            icono: '📈',
            color: 'bg-cyan-100 text-cyan-700',
            explicacion: 'Lo que te queda limpio (Ventas menos Gastos).',
          },
          {
            label: 'Pedidos Atendidos',
            valor: `${data.pedidos} pedidos`,
            icono: '📋',
            color: 'bg-orange-100 text-orange-700',
            explicacion: 'Cantidad total de comandas procesadas hoy.',
          },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.pedidosService.getAll().subscribe({
      next: ({ data }) => this.pedidos.set(data),
    });
  }

  totalPedido(pedido: any): string {
    return (pedido.detalles || [])
      .reduce((sum: number, d: any) => sum + d.cantidad * parseFloat(d.precio_unitario), 0)
      .toFixed(2);
  }

  confirmarAbrirCaja() {
    const monto = parseFloat(this.montoInicialInput as any) || 0;
    this.cajaService.abrir(monto).subscribe({
      next: ({ data }) => {
        this.sesionCaja.set(data);
        this.modalAbrir.set(false);
      },
    });
  }

  confirmarCerrarCaja() {
    if (!this.sesionCaja()) return;
    this.cajaService.cerrar(this.sesionCaja().id).subscribe({
      next: () => {
        this.sesionCaja.set(null);
        this.modalCerrar.set(false);
        this.cargarDatos();
      },
    });
  }
}
