import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CajaService } from '../../../core/services/caja.service';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="space-y-6">

      <!-- Header con Explicación -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Control de Compras y Gastos</h1>
          <p class="text-slate-500 text-sm">
            Registra lo que gastas para preparar tus platos y operar la cevichería
          </p>
        </div>
        <button
          (click)="modalCategoria.set(true)"
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-slate-200 flex items-center gap-1.5 w-fit"
        >
          <span>➕</span> Nueva categoría de gasto
        </button>
      </div>

      <!-- Banner Informativo -->
      <div class="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex items-start gap-3 text-cyan-900 text-xs">
        <span class="text-2xl flex-shrink-0">📌</span>
        <div>
          <p class="font-bold mb-0.5">¿Por qué es importante anotar tus compras aquí?</p>
          <p class="text-cyan-800 leading-relaxed">
            Cada gasto que registras se descuenta automáticamente de tus ventas. Así en <strong>Reportes</strong> y en el <strong>Dashboard</strong> sabrás tu <strong>Ganancia Neta Real</strong> sin sorpresas a fin de mes.
          </p>
        </div>
      </div>

      <!-- Formulario para Registrar Gasto -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <h2 class="font-bold text-slate-800 text-base">Anotar una nueva compra o gasto</h2>
          <p class="text-xs text-slate-400">Selecciona qué compraste y cuánto costó</p>
        </div>

        <!-- Atajos rápidos para cevichería -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span class="text-xs font-semibold text-slate-500">Compras comunes:</span>
          <button
            type="button"
            (click)="usarAtajo('Pescado fresco del día', 'Insumos')"
            class="text-xs bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
          >
            🐟 Pescado
          </button>
          <button
            type="button"
            (click)="usarAtajo('Mariscos y langostinos', 'Insumos')"
            class="text-xs bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
          >
            🦐 Mariscos
          </button>
          <button
            type="button"
            (click)="usarAtajo('Limón, cebolla y verduras', 'Insumos')"
            class="text-xs bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
          >
            🍋 Limón / Verduras
          </button>
          <button
            type="button"
            (click)="usarAtajo('Balón de gas', 'Servicios')"
            class="text-xs bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
          >
            🔥 Balón de gas
          </button>
          <button
            type="button"
            (click)="usarAtajo('Bolsas, envases y descartables', 'Insumos')"
            class="text-xs bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 px-3 py-1 rounded-xl transition-colors font-medium"
          >
            🥡 Envases para llevar
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Fecha de la compra</label>
            <input
              type="date"
              [(ngModel)]="nuevoGasto.fecha"
              class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Tipo de gasto *</label>
            <select
              [(ngModel)]="nuevoGasto.categoria_movimiento_id"
              class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
            >
              <option value="">Seleccionar categoría...</option>
              @for (cat of categorias(); track cat.id) {
                <option [value]="cat.id">{{ cat.nombre }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">¿Qué compraste? (Detalle)</label>
            <input
              type="text"
              [(ngModel)]="nuevoGasto.descripcion"
              placeholder="Ej: 4kg Corvina, Limón criollo"
              class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Monto pagado en Soles (S/) *</label>
            <input
              type="number"
              [(ngModel)]="nuevoGasto.monto"
              placeholder="0.00"
              step="0.50"
              min="0"
              class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div class="flex items-end">
            <button
              (click)="registrar()"
              [disabled]="guardando()"
              class="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors py-2.5 text-sm shadow-md shadow-orange-500/20"
            >
              {{ guardando() ? 'Guardando...' : '💾 Guardar gasto' }}
            </button>
          </div>

        </div>

        @if (errorMsg()) {
          <p class="text-red-500 text-xs font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200">{{ errorMsg() }}</p>
        }
      </div>

      <!-- Filtro por Fecha -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5 text-sm">
          <span class="font-bold text-slate-700">Ver gastos desde:</span>
          <input
            type="date"
            [(ngModel)]="filtro.desde"
            class="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <span class="text-slate-400 text-xs">hasta:</span>
          <input
            type="date"
            [(ngModel)]="filtro.hasta"
            class="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            (click)="buscar()"
            class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Filtrar fechas
          </button>
        </div>
      </div>

      <!-- Resumen por Categoría -->
      @if (resumenCategorias().length > 0) {
        <div>
          <h3 class="text-sm font-bold text-slate-700 mb-3">¿En qué se fue el dinero en este período?</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            @for (cat of resumenCategorias(); track cat.nombre) {
              <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p class="text-slate-400 text-xs font-bold uppercase tracking-wide mb-0.5">{{ cat.nombre }}</p>
                <p class="text-xl font-black text-red-500">S/ {{ cat.total.toFixed(2) }}</p>
              </div>
            }
            <div class="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p class="text-red-500 text-xs font-bold uppercase tracking-wide mb-0.5">Total Gastado</p>
              <p class="text-xl font-black text-red-600">S/ {{ totalGastos().toFixed(2) }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Tabla de Gastos -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="font-bold text-slate-800">Detalle de cada compra registrada</h2>
            <p class="text-xs text-slate-400">Lista completa de salidas de dinero</p>
          </div>
          <span class="text-slate-500 text-xs font-bold bg-slate-100 px-3 py-1 rounded-full">
            {{ gastos().length }} compras
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th class="px-5 py-3 text-left">Fecha</th>
                <th class="px-5 py-3 text-left">Categoría</th>
                <th class="px-5 py-3 text-left">Descripción / Qué se compró</th>
                <th class="px-5 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (gasto of gastos(); track gasto.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-3.5 text-slate-600 text-xs font-medium">{{ gasto.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td class="px-5 py-3.5">
                    <span class="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {{ gasto.categoria_movimiento.nombre }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-slate-800 font-medium">{{ gasto.descripcion || 'Sin descripción' }}</td>
                  <td class="px-5 py-3.5 text-right font-black text-red-500">- S/ {{ parseFloat(gasto.monto).toFixed(2) }}</td>
                </tr>
              }
              @if (gastos().length === 0) {
                <tr>
                  <td colspan="4" class="text-center py-12 text-slate-400">
                    <p class="text-3xl mb-1">🛒</p>
                    <p class="text-sm">No se encontraron gastos en este rango de fechas</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Modal Nueva Categoría -->
    @if (modalCategoria()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
          <div class="text-center">
            <div class="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl">
              🏷️
            </div>
            <h2 class="text-lg font-black text-slate-800">Nueva categoría de gasto</h2>
            <p class="text-xs text-slate-500">Crea un nuevo grupo para clasificar tus compras</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Nombre de la categoría</label>
            <input
              type="text"
              [(ngModel)]="nuevaCategoria"
              placeholder="Ej: Alquiler, Sueldos, Gas, Bebidas..."
              class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              (click)="modalCategoria.set(false)"
              class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="crearCategoria()"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-cyan-200"
            >
              Crear categoría
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class GastosComponent implements OnInit {
  private cajaService = inject(CajaService);

  gastos = signal<any[]>([]);
  categorias = signal<any[]>([]);
  resumenCategorias = signal<any[]>([]);
  guardando = signal(false);
  errorMsg = signal('');
  modalCategoria = signal(false);
  nuevaCategoria = '';

  parseFloat = parseFloat;

  private toLocalDateStr(d: Date = new Date()): string {
    return d.toLocaleDateString('en-CA');
  }

  nuevoGasto: any = {
    fecha: this.toLocalDateStr(),
    categoria_movimiento_id: '',
    descripcion: '',
    monto: null,
  };

  filtro = {
    desde: this.inicioSemana(),
    hasta: this.toLocalDateStr(),
  };

  totalGastos = signal(0);

  ngOnInit() {
    this.cajaService.getCategorias().subscribe({
      next: ({ data }) => {
        const egresos = (data || []).filter((c: any) => c.tipo === 'EGRESO');
        this.categorias.set(egresos);
      },
    });
    this.buscar();
  }

  usarAtajo(descripcion: string, nombreCategoria: string) {
    this.nuevoGasto.descripcion = descripcion;
    const cat = this.categorias().find((c) =>
      c.nombre.toLowerCase().includes(nombreCategoria.toLowerCase())
    ) || this.categorias()[0];
    if (cat) {
      this.nuevoGasto.categoria_movimiento_id = cat.id;
    }
  }

  buscar() {
    this.cajaService.getMovimientosPorRango(this.filtro.desde, this.filtro.hasta).subscribe({
      next: ({ data }) => {
        const egresos = (data || []).filter((m: any) => m.categoria_movimiento.tipo === 'EGRESO');
        this.gastos.set(egresos);
        this.calcularResumen(egresos);
      },
    });
  }

  calcularResumen(gastos: any[]) {
    const agrupado: Record<string, number> = {};
    let total = 0;
    for (const g of gastos) {
      const nombre = g.categoria_movimiento.nombre;
      agrupado[nombre] = (agrupado[nombre] || 0) + parseFloat(g.monto);
      total += parseFloat(g.monto);
    }
    this.resumenCategorias.set(
      Object.entries(agrupado).map(([nombre, total]) => ({ nombre, total }))
    );
    this.totalGastos.set(total);
  }

  registrar() {
    if (!this.nuevoGasto.categoria_movimiento_id || !this.nuevoGasto.monto) {
      this.errorMsg.set('Selecciona una categoría e ingresa el monto pagado');
      return;
    }
    this.guardando.set(true);
    this.errorMsg.set('');

    this.cajaService.getSesionActiva().subscribe({
      next: ({ data: sesion }) => {
        const registrarMov = (sesionId: number) => {
          this.cajaService.crearMovimiento({
            sesion_caja_id: sesionId,
            categoria_movimiento_id: +this.nuevoGasto.categoria_movimiento_id,
            monto: parseFloat(this.nuevoGasto.monto),
            descripcion: this.nuevoGasto.descripcion,
            fecha: this.nuevoGasto.fecha,
          }).subscribe({
            next: () => {
              this.nuevoGasto = {
                fecha: this.toLocalDateStr(),
                categoria_movimiento_id: '',
                descripcion: '',
                monto: null,
              };
              this.guardando.set(false);
              this.buscar();
            },
            error: () => { this.errorMsg.set('Error al registrar el gasto'); this.guardando.set(false); },
          });
        };

        if (sesion) {
          registrarMov(sesion.id);
        } else {
          this.cajaService.abrir(0).subscribe({
            next: ({ data: nuevaSesion }) => registrarMov(nuevaSesion.id),
            error: () => { this.errorMsg.set('Error al inicializar sesión de caja'); this.guardando.set(false); },
          });
        }
      },
    });
  }

  crearCategoria() {
    if (!this.nuevaCategoria.trim()) return;
    this.cajaService.crearCategoria({ nombre: this.nuevaCategoria.trim(), tipo: 'EGRESO' }).subscribe({
      next: () => {
        this.nuevaCategoria = '';
        this.modalCategoria.set(false);
        this.cajaService.getCategorias().subscribe({
          next: ({ data }) => this.categorias.set((data || []).filter((c: any) => c.tipo === 'EGRESO')),
        });
      },
    });
  }

  inicioSemana(): string {
    const d = new Date();
    const dia = d.getDay();
    d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
    return this.toLocalDateStr(d);
  }
}
