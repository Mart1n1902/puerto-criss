import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CajaService } from '../../../core/services/caja.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="space-y-6">

      <!-- Header con Explicación -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Control de Caja Diaria</h1>
          <p class="text-slate-500 text-sm">
            Controla el dinero en efectivo que entra y sale de tu gaveta durante el turno
          </p>
        </div>

        @if (sesion()) {
          <div class="flex items-center gap-2.5">
            <button
              (click)="modalComprobante.set(true)"
              class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors border border-slate-200 flex items-center gap-1.5 shadow-sm"
            >
              <span>📄</span> Comprobante / Ticket
            </button>
            <span class="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Turno en curso
            </span>
          </div>
        }
      </div>

      <!-- Sin sesión activa -->
      @if (!sesion()) {
        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center max-w-lg mx-auto">
          <div class="w-20 h-20 bg-cyan-50 border-2 border-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
            💰
          </div>
          <h2 class="text-2xl font-black text-slate-800 mb-2">La caja está cerrada</h2>
          <p class="text-slate-500 text-sm leading-relaxed mb-6">
            Antes de comenzar a atender, ingresa con cuánto <strong>dinero en efectivo (sencillo)</strong> estás iniciando en tu cajón para dar vuelto.
          </p>

          <div class="space-y-4 max-w-xs mx-auto">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Sencillo inicial (S/)
              </label>
              <input
                type="number"
                [(ngModel)]="montoInicial"
                placeholder="0.00"
                min="0"
                class="w-full border-2 border-slate-200 focus:border-cyan-500 rounded-2xl px-4 py-3 text-center text-3xl font-black text-slate-900 focus:outline-none transition-colors"
              />
            </div>

            <!-- Botones rápidos de sencillo -->
            <div class="flex justify-center gap-2">
              <button (click)="montoInicial = 30" class="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-slate-700 transition-colors">S/ 30</button>
              <button (click)="montoInicial = 50" class="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-slate-700 transition-colors">S/ 50</button>
              <button (click)="montoInicial = 100" class="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-slate-700 transition-colors">S/ 100</button>
            </div>

            <button
              (click)="abrir()"
              class="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 text-base"
            >
              Abrir caja e iniciar turno
            </button>
          </div>
        </div>
      }

      <!-- Sesión activa -->
      @if (sesion()) {
        <!-- Tarjeta explicativa de balance -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (m of resumen(); track m.label) {
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <p class="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">{{ m.label }}</p>
                <p [class]="m.color" class="text-2xl font-black">{{ m.valor }}</p>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-50">
                {{ m.ayuda }}
              </p>
            </div>
          }
        </div>

        <!-- Registrar movimiento rápido -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-bold text-slate-800 text-base">Registrar salida o ingreso de efectivo</h2>
              <p class="text-xs text-slate-400">¿Sacaste dinero del cajón para comprar hielo, pagar al delivery o meter más sencillo?</p>
            </div>
          </div>

          <!-- Accesos rápidos / Plantillas -->
          <div class="flex flex-wrap gap-2 pt-1">
            <span class="text-xs font-semibold text-slate-500 py-1">Atajos rápidos:</span>
            <button
              type="button"
              (click)="usarAtajo('Compra de pescado fresco', 'EGRESO')"
              class="text-xs bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
            >
              🐟 Pescado
            </button>
            <button
              type="button"
              (click)="usarAtajo('Compra de hielo / limones', 'EGRESO')"
              class="text-xs bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
            >
              🧊 Hielo / Limón
            </button>
            <button
              type="button"
              (click)="usarAtajo('Pago a repartidor de delivery', 'EGRESO')"
              class="text-xs bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
            >
              🛵 Pago Delivery
            </button>
            <button
              type="button"
              (click)="usarAtajo('Ingreso de sencillo adicional', 'INGRESO')"
              class="text-xs bg-slate-100 hover:bg-green-50 hover:text-green-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
            >
              🪙 Sencillo extra (+)
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Categoría</label>
              <select [(ngModel)]="nuevoMov.categoria_movimiento_id"
                class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white">
                <option value="">Selecciona tipo...</option>
                @for (cat of categorias(); track cat.id) {
                  <option [value]="cat.id">
                    {{ cat.tipo === 'INGRESO' ? '🟢 (+)' : '🔴 (-)' }} {{ cat.nombre }}
                  </option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Monto en Soles (S/)</label>
              <input
                type="number"
                [(ngModel)]="nuevoMov.monto"
                placeholder="0.00"
                step="0.50"
                class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Motivo / Descripción</label>
              <input
                type="text"
                [(ngModel)]="nuevoMov.descripcion"
                placeholder="Ej: 5 bolsas de hielo"
                class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div class="flex items-end">
              <button
                (click)="registrarMovimiento()"
                class="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-bold rounded-xl transition-colors py-2.5 text-sm shadow-md shadow-orange-500/20"
              >
                + Guardar movimiento
              </button>
            </div>
          </div>
        </div>

        <!-- Movimientos del turno -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="font-bold text-slate-800">Historial de entradas y salidas de este turno</h2>
              <p class="text-xs text-slate-400">Las ventas cobradas y los gastos registrados aparecen automáticamente aquí</p>
            </div>
            <div class="flex gap-2">
              <button
                (click)="modalComprobante.set(true)"
                class="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>🖨️</span> Ver comprobante
              </button>
              <button
                (click)="modalCerrar.set(true)"
                class="bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>🔒</span> Cerrar caja del día
              </button>
            </div>
          </div>

          <div class="divide-y divide-slate-100">
            @for (mov of movimientos(); track mov.id) {
              <div class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                  <span
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    [class]="mov.categoria_movimiento.tipo === 'INGRESO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                  >
                    {{ mov.categoria_movimiento.tipo === 'INGRESO' ? '↓' : '↑' }}
                  </span>
                  <div>
                    <p class="font-bold text-slate-800 text-sm">{{ mov.descripcion || mov.categoria_movimiento.nombre }}</p>
                    <p class="text-xs text-slate-400">{{ mov.categoria_movimiento.nombre }} · {{ mov.categoria_movimiento.tipo }}</p>
                  </div>
                </div>
                <span
                  [class]="mov.categoria_movimiento.tipo === 'INGRESO' ? 'text-green-600 font-black' : 'text-red-500 font-bold'"
                  class="text-sm"
                >
                  {{ mov.categoria_movimiento.tipo === 'INGRESO' ? '+' : '-' }} S/ {{ parseFloat(mov.monto).toFixed(2) }}
                </span>
              </div>
            }
            @if (movimientos().length === 0) {
              <div class="text-center py-10 text-slate-400">
                <p class="text-3xl mb-1">🧾</p>
                <p class="text-sm">Aún no hay movimientos en este turno</p>
              </div>
            }
          </div>
        </div>
      }

    </div>

    <!-- Modal Confirmar Cerrar Caja -->
    @if (modalCerrar()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 text-center">
          <div class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-3xl">
            🔒
          </div>
          <h2 class="text-xl font-black text-slate-800">¿Listo para cerrar caja?</h2>
          <p class="text-xs text-slate-500 leading-relaxed">
            El sistema calculará el total que debes tener en efectivo en tu cajón:
          </p>

          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Sencillo inicial:</span>
              <strong class="text-slate-800">S/ {{ parseFloat(sesion()?.monto_inicial || 0).toFixed(2) }}</strong>
            </div>
            <div class="flex justify-between text-green-700">
              <span>+ Ventas e ingresos:</span>
              <strong>S/ {{ totalIngresos().toFixed(2) }}</strong>
            </div>
            <div class="flex justify-between text-red-600">
              <span>- Salidas y compras:</span>
              <strong>S/ {{ totalEgresos().toFixed(2) }}</strong>
            </div>
            <div class="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Efectivo a entregar:</span>
              <span class="text-cyan-600">S/ {{ balanceFinal().toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              (click)="modalCerrar.set(false)"
              class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              (click)="confirmarCerrar()"
              class="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-3 rounded-2xl transition-all shadow-md shadow-red-200 text-sm"
            >
              Sí, cerrar turno
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Comprobante / Ticket Imprimible en PDF -->
    @if (modalComprobante()) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
          
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-xl">📄</span>
              <h2 class="font-black text-slate-800 text-sm">Comprobante de Cierre de Caja</h2>
            </div>
            <button (click)="modalComprobante.set(false)" class="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">✕</button>
          </div>

          <!-- Contenedor del Ticket para Imprimir -->
          <div id="ticket-cierre" class="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 space-y-4 bg-white">
            
            <!-- Encabezado Ticket -->
            <div class="text-center border-b border-dashed border-slate-300 pb-3">
              <p class="text-lg font-black tracking-widest text-slate-900">PUERTO CRISS</p>
              <p class="text-[11px] text-slate-500">Cevichería & Marisquería</p>
              <p class="text-[10px] text-slate-400 mt-1">COMPROBANTE DE CIERRE DE CAJA</p>
              <p class="text-[10px] text-slate-400 font-sans">Turno #{{ sesion()?.id }} · {{ hoy | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="text-[10px] text-slate-500 mt-0.5">Responsable: {{ auth.user()?.nombre || 'Administrador' }}</p>
            </div>

            <!-- Resumen Financiero -->
            <div class="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div class="flex justify-between">
                <span>SENCILLO INICIAL:</span>
                <span class="font-bold">S/ {{ parseFloat(sesion()?.monto_inicial || 0).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-green-700">
                <span>(+) TOTAL INGRESOS:</span>
                <span class="font-bold">S/ {{ totalIngresos().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-red-600">
                <span>(-) TOTAL EGRESOS/GASTOS:</span>
                <span class="font-bold">S/ {{ totalEgresos().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm font-black pt-2 border-t border-slate-200">
                <span>TOTAL EFECTIVO EN CAJA:</span>
                <span class="text-slate-900">S/ {{ balanceFinal().toFixed(2) }}</span>
              </div>
            </div>

            <!-- Detalle de Movimientos -->
            <div class="space-y-1 border-b border-dashed border-slate-300 pb-3">
              <p class="font-bold text-[10px] uppercase text-slate-400 mb-1">MOVIMIENTOS DEL TURNO ({{ movimientos().length }})</p>
              @for (m of movimientos(); track m.id) {
                <div class="flex justify-between text-[11px]">
                  <span class="truncate max-w-[200px]">{{ m.descripcion || m.categoria_movimiento.nombre }}</span>
                  <span [class]="m.categoria_movimiento.tipo === 'INGRESO' ? 'text-green-700' : 'text-red-600'">
                    {{ m.categoria_movimiento.tipo === 'INGRESO' ? '+' : '-' }} S/ {{ parseFloat(m.monto).toFixed(2) }}
                  </span>
                </div>
              }
              @if (movimientos().length === 0) {
                <p class="text-[10px] text-slate-400 italic">Sin movimientos registrados</p>
              }
            </div>

            <!-- Firmas -->
            <div class="pt-6 grid grid-cols-2 gap-6 text-center text-[10px] text-slate-400">
              <div>
                <div class="border-b border-slate-400 h-8 mb-1"></div>
                <p>Cajero / Responsable</p>
              </div>
              <div>
                <div class="border-b border-slate-400 h-8 mb-1"></div>
                <p>Administrador / Dueño</p>
              </div>
            </div>

          </div>

          <!-- Acciones -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0">
            <button
              (click)="modalComprobante.set(false)"
              class="flex-1 border border-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-100 transition-colors"
            >
              Cerrar
            </button>
            <button
              (click)="imprimirTicket()"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-cyan-200 flex items-center justify-center gap-1.5"
            >
              <span>🖨️</span> Imprimir / PDF
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class CajaComponent implements OnInit {
  private cajaService = inject(CajaService);
  auth = inject(AuthService);

  sesion = signal<any>(null);
  movimientos = signal<any[]>([]);
  categorias = signal<any[]>([]);
  montoInicial = 50;
  nuevoMov: any = { categoria_movimiento_id: '', monto: null, descripcion: '' };
  modalCerrar = signal(false);
  modalComprobante = signal(false);

  resumen = signal<any[]>([]);
  totalIngresos = signal(0);
  totalEgresos = signal(0);
  balanceFinal = signal(0);
  hoy = new Date();

  parseFloat = parseFloat;

  ngOnInit() {
    this.cajaService.getCategorias().subscribe(({ data }) => this.categorias.set(data || []));
    this.cargarSesion();
  }

  cargarSesion() {
    this.cajaService.getSesionActiva().subscribe({
      next: ({ data }) => {
        this.sesion.set(data);
        if (data) {
          this.cargarMovimientos(data.id);
        } else {
          this.movimientos.set([]);
          this.resumen.set([]);
        }
      },
      error: () => {
        this.sesion.set(null);
        this.movimientos.set([]);
      },
    });
  }

  cargarMovimientos(sesionId: number) {
    this.cajaService.getMovimientos(sesionId).subscribe({
      next: ({ data }: { data: any[] }) => {
        const list = data || [];
        this.movimientos.set(list);
        this.calcularResumen(list);
      },
    });
  }

  calcularResumen(movimientos: any[]) {
    const inicial = parseFloat(this.sesion()?.monto_inicial || 0);
    const ingresos = movimientos
      .filter((m) => m.categoria_movimiento.tipo === 'INGRESO')
      .reduce((s, m) => s + parseFloat(m.monto), 0);
    const egresos = movimientos
      .filter((m) => m.categoria_movimiento.tipo === 'EGRESO')
      .reduce((s, m) => s + parseFloat(m.monto), 0);
    const balance = inicial + ingresos - egresos;

    this.totalIngresos.set(ingresos);
    this.totalEgresos.set(egresos);
    this.balanceFinal.set(balance);

    this.resumen.set([
      {
        label: 'Sencillo Inicial',
        valor: `S/ ${inicial.toFixed(2)}`,
        color: 'text-slate-800',
        ayuda: 'Dinero base con el que abrió la caja hoy.',
      },
      {
        label: 'Ventas e Ingresos (+)',
        valor: `S/ ${ingresos.toFixed(2)}`,
        color: 'text-green-600',
        ayuda: 'Ventas de pedidos cobrados y dinero ingresado.',
      },
      {
        label: 'Salidas y Compras (-)',
        valor: `S/ ${egresos.toFixed(2)}`,
        color: 'text-red-500',
        ayuda: 'Pagos realizados en efectivo durante el turno.',
      },
      {
        label: 'Total a Contar en Gaveta',
        valor: `S/ ${balance.toFixed(2)}`,
        color: balance >= 0 ? 'text-cyan-600' : 'text-orange-500',
        ayuda: 'Dinero físico que debes tener en la mano.',
      },
    ]);
  }

  usarAtajo(descripcion: string, tipo: 'INGRESO' | 'EGRESO') {
    this.nuevoMov.descripcion = descripcion;
    const cat = this.categorias().find((c) => c.tipo === tipo);
    if (cat) {
      this.nuevoMov.categoria_movimiento_id = cat.id;
    }
  }

  abrir() {
    const monto = parseFloat(this.montoInicial as any) || 0;
    this.cajaService.abrir(monto).subscribe({
      next: ({ data }) => {
        this.sesion.set(data);
        this.movimientos.set([]);
        this.calcularResumen([]);
      },
    });
  }

  confirmarCerrar() {
    if (!this.sesion()) return;
    this.cajaService.cerrar(this.sesion().id).subscribe({
      next: () => {
        this.modalCerrar.set(false);
        this.modalComprobante.set(true); // Mostrar el comprobante final
        this.sesion.set(null);
        this.movimientos.set([]);
      },
    });
  }

  registrarMovimiento() {
    if (!this.nuevoMov.categoria_movimiento_id || !this.nuevoMov.monto) return;
    const data = {
      ...this.nuevoMov,
      sesion_caja_id: this.sesion().id,
      monto: parseFloat(this.nuevoMov.monto),
    };
    this.cajaService.crearMovimiento(data).subscribe({
      next: () => {
        this.nuevoMov = { categoria_movimiento_id: '', monto: null, descripcion: '' };
        this.cargarMovimientos(this.sesion().id);
      },
    });
  }

  imprimirTicket() {
    const printContent = document.getElementById('ticket-cierre');
    if (!printContent) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante de Cierre - Puerto Criss</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .dashed { border-bottom: 1px dashed #000; margin: 10px 0; }
          .flex { display: flex; justify-content: space-between; margin: 4px 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; text-align: center; }
          .line { border-bottom: 1px solid #000; height: 30px; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
