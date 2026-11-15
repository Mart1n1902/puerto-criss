import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { CajaService } from '../../../core/services/caja.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-8">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Mis Reportes</h1>
          <p class="text-slate-500 text-xs sm:text-sm mt-0.5">Aquí puedes ver el rendimiento y ganancias de tu restaurante</p>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <button
            (click)="generarResumen()"
            [disabled]="loadingIA()"
            class="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {{ loadingIA() ? '⏳ Analizando...' : '🤖 Resumen con IA' }}
          </button>
          <button
            (click)="descargarVentasDetalladasCSV()"
            class="flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            📊 Ventas Detalladas (CSV)
          </button>
          <button
            (click)="exportarExcel()"
            class="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            📥 Resumen (Excel)
          </button>
        </div>
      </div>


      <!-- Resumen IA -->
      @if (resumenIA()) {
        <div class="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-2xl p-6">
          <div class="flex items-start gap-3">
            <span class="text-3xl">🤖</span>
            <div>
              <p class="font-bold text-purple-800 mb-2">Resumen de tu negocio</p>
              <p class="text-slate-700 leading-relaxed">{{ resumenIA() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- KPIs en lenguaje simple -->
      @if (kpis()) {
        <div class="space-y-4">

          <!-- Hoy -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p class="text-slate-500 text-sm font-medium mb-4 uppercase tracking-wide">📅 Hoy</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-green-50 rounded-xl">
                <p class="text-3xl font-bold text-green-600">S/ {{ kpis().dia.ventas.toFixed(2) }}</p>
                <p class="text-sm text-green-700 mt-1 font-medium">Lo que vendiste</p>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-xl">
                <p class="text-3xl font-bold text-red-500">S/ {{ kpis().dia.gastos.toFixed(2) }}</p>
                <p class="text-sm text-red-600 mt-1 font-medium">Lo que gastaste</p>
              </div>
              <div class="text-center p-4 rounded-xl" [class]="kpis().dia.ganancia >= 0 ? 'bg-cyan-50' : 'bg-orange-50'">
                <p class="text-3xl font-bold" [class]="kpis().dia.ganancia >= 0 ? 'text-cyan-600' : 'text-orange-500'">
                  S/ {{ kpis().dia.ganancia.toFixed(2) }}
                </p>
                <p class="text-sm mt-1 font-medium" [class]="kpis().dia.ganancia >= 0 ? 'text-cyan-700' : 'text-orange-600'">
                  {{ kpis().dia.ganancia >= 0 ? 'Tu ganancia' : 'Pérdida del día' }}
                </p>
              </div>
              <div class="text-center p-4 rounded-xl" [class]="kpis().dia.margen >= 20 ? 'bg-green-50' : 'bg-yellow-50'">
                <p class="text-3xl font-bold" [class]="kpis().dia.margen >= 20 ? 'text-green-600' : 'text-yellow-600'">
                  {{ kpis().dia.margen.toFixed(0) }}%
                </p>
                <p class="text-sm mt-1 font-medium" [class]="kpis().dia.margen >= 20 ? 'text-green-700' : 'text-yellow-700'">
                  De cada S/100 ganás S/{{ kpis().dia.margen.toFixed(0) }}
                </p>
              </div>
            </div>
            <!-- Mensaje de estado -->
            <div class="mt-4 p-3 rounded-xl text-sm font-medium"
              [class]="kpis().dia.ganancia >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">
              {{ kpis().dia.ganancia >= 0
                ? '✅ Hoy el negocio está generando ganancias'
                : '⚠️ Hoy los gastos superan las ventas. Revisá tus costos.' }}
            </div>
          </div>

          <!-- Esta semana y este mes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p class="text-slate-500 text-sm font-medium mb-4 uppercase tracking-wide">📆 Esta semana</p>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-slate-100">
                  <span class="text-slate-600">💰 Vendiste</span>
                  <span class="font-bold text-green-600 text-lg">S/ {{ kpis().semana.ventas.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-100">
                  <span class="text-slate-600">💸 Gastaste</span>
                  <span class="font-bold text-red-500 text-lg">S/ {{ kpis().semana.gastos.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-slate-700 font-medium">📈 Ganancia neta</span>
                  <span class="font-bold text-xl" [class]="kpis().semana.ganancia >= 0 ? 'text-cyan-600' : 'text-red-500'">
                    S/ {{ kpis().semana.ganancia.toFixed(2) }}
                  </span>
                </div>
                <div class="bg-slate-50 rounded-xl p-3 text-center">
                  <p class="text-slate-500 text-xs">Margen de ganancia</p>
                  <p class="text-2xl font-bold text-slate-800">{{ kpis().semana.margen.toFixed(1) }}%</p>
                  <div class="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div class="h-2 rounded-full transition-all"
                      [class]="kpis().semana.margen >= 20 ? 'bg-green-500' : 'bg-yellow-400'"
                      [style.width.%]="Math.min(kpis().semana.margen, 100)">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p class="text-slate-500 text-sm font-medium mb-4 uppercase tracking-wide">🗓️ Este mes</p>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-slate-100">
                  <span class="text-slate-600">💰 Vendiste</span>
                  <span class="font-bold text-green-600 text-lg">S/ {{ kpis().mes.ventas.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-100">
                  <span class="text-slate-600">💸 Gastaste</span>
                  <span class="font-bold text-red-500 text-lg">S/ {{ kpis().mes.gastos.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-slate-700 font-medium">📈 Ganancia neta</span>
                  <span class="font-bold text-xl" [class]="kpis().mes.ganancia >= 0 ? 'text-cyan-600' : 'text-red-500'">
                    S/ {{ kpis().mes.ganancia.toFixed(2) }}
                  </span>
                </div>
                <div class="bg-slate-50 rounded-xl p-3 text-center">
                  <p class="text-slate-500 text-xs">Margen de ganancia</p>
                  <p class="text-2xl font-bold text-slate-800">{{ kpis().mes.margen.toFixed(1) }}%</p>
                  <div class="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div class="h-2 rounded-full transition-all"
                      [class]="kpis().mes.margen >= 20 ? 'bg-green-500' : 'bg-yellow-400'"
                      [style.width.%]="Math.min(kpis().mes.margen, 100)">
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- Gráfico ventas por día -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h2 class="font-bold text-slate-800">¿Cuánto vendiste cada día?</h2>
            <p class="text-slate-400 text-sm">Las barras más altas son tus mejores días</p>
          </div>
          <select
            [(ngModel)]="diasSeleccionados"
            (ngModelChange)="cargarVentas()"
            class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option [value]="7">Últimos 7 días</option>
            <option [value]="14">Últimos 14 días</option>
            <option [value]="30">Últimos 30 días</option>
          </select>
        </div>
        <div class="relative h-64 mt-4">
          <canvas #ventasChart></canvas>
        </div>
      </div>

      <!-- Comparativa semanal -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div class="mb-2">
          <h2 class="font-bold text-slate-800">¿Cómo van tus semanas?</h2>
          <p class="text-slate-400 text-sm">Azul = ventas · Naranja = gastos · Verde = ganancia</p>
        </div>
        <div class="relative h-64 mt-4">
          <canvas #semanalChart></canvas>
        </div>
      </div>

      <!-- Gastos por categoría -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="font-bold text-slate-800">¿En qué estás gastando?</h2>
            <p class="text-slate-400 text-sm">Seleccioná un período para ver el detalle</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <input type="date" [(ngModel)]="filtro.desde"
              class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" />
            <span class="text-slate-400 text-sm">al</span>
            <input type="date" [(ngModel)]="filtro.hasta"
              class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" />
            <button (click)="cargarGastosPorCategoria()"
              class="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
              Ver
            </button>
          </div>
        </div>

        @if (categoriasData().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div class="relative h-64">
              <canvas #categoriaChart></canvas>
            </div>
            <!-- Lista con montos -->
            <div class="space-y-3">
              @for (item of categoriasData(); track item.nombre; let i = $index) {
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" [style.background]="colores[i % colores.length]"></span>
                    <span class="text-sm text-slate-700">{{ item.nombre }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full"
                      [class]="item.tipo === 'INGRESO' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                      {{ item.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto' }}
                    </span>
                  </div>
                  <span class="font-bold text-slate-800">S/ {{ item.total.toFixed(2) }}</span>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="text-center py-10 text-slate-400">
            <p class="text-4xl mb-2">📊</p>
            <p>Seleccioná un período y hacé click en "Ver"</p>
          </div>
        }
      </div>

    </div>
  `,
})
export class ReportesComponent implements OnInit, AfterViewInit {
  @ViewChild('ventasChart') ventasChartRef!: ElementRef;
  @ViewChild('semanalChart') semanalChartRef!: ElementRef;
  @ViewChild('categoriaChart') categoriaChartRef!: ElementRef;

  private reportesService = inject(ReportesService);
  private cajaService = inject(CajaService);

  kpis = signal<any>(null);
  ventasData = signal<any[]>([]);
  semanalData = signal<any[]>([]);
  categoriasData = signal<any[]>([]);
  resumenIA = signal<string>('');
  loadingIA = signal(false);
  diasSeleccionados = 7;
  Math = Math;

  colores = ['#06b6d4', '#f97316', '#ef4444', '#22c55e', '#8b5cf6', '#f59e0b', '#64748b'];

  private toLocalDateStr(d: Date = new Date()): string {
    return d.toLocaleDateString('en-CA');
  }

  filtro = {
    desde: this.inicioMes(),
    hasta: this.toLocalDateStr(),
  };

  private charts: Record<string, Chart> = {};

  ngOnInit() {
    this.reportesService.getKpis().subscribe({ next: ({ data }) => this.kpis.set(data) });
    this.cargarVentas();
    this.cargarComparativa();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.renderVentasChart();
      this.renderSemanalChart();
    }, 300);
  }

  cargarVentas() {
    this.reportesService.getVentasPorDia(this.diasSeleccionados).subscribe({
      next: ({ data }) => { this.ventasData.set(data); this.renderVentasChart(); },
    });
  }

  cargarComparativa() {
    this.reportesService.getComparativaSemanal(4).subscribe({
      next: ({ data }) => { this.semanalData.set(data); this.renderSemanalChart(); },
    });
  }

  cargarGastosPorCategoria() {
    this.reportesService.getGastosPorCategoria(this.filtro.desde, this.filtro.hasta).subscribe({
      next: ({ data }) => { this.categoriasData.set(data); setTimeout(() => this.renderCategoriaChart(), 100); },
    });
  }

  renderVentasChart() {
    if (!this.ventasChartRef) return;
    this.charts['ventas']?.destroy();
    const data = this.ventasData();
    this.charts['ventas'] = new Chart(this.ventasChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map((d) => new Date(d.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })),
        datasets: [{
          label: 'Ventas S/',
          data: data.map((d) => +d.total),
          backgroundColor: '#06b6d4',
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => `S/ ${v}` },
          },
        },
      },
    });
  }

  renderSemanalChart() {
    if (!this.semanalChartRef) return;
    this.charts['semanal']?.destroy();
    const data = this.semanalData();
    this.charts['semanal'] = new Chart(this.semanalChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map((d) => `${d.semana} (${d.desde})`),
        datasets: [
          { label: 'Ventas', data: data.map((d) => d.ventas), backgroundColor: '#06b6d4', borderRadius: 6 },
          { label: 'Gastos', data: data.map((d) => d.gastos), backgroundColor: '#f97316', borderRadius: 6 },
          { label: 'Ganancia', data: data.map((d) => d.ganancia), backgroundColor: '#22c55e', borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => `S/ ${v}` } } },
      },
    });
  }

  renderCategoriaChart() {
    if (!this.categoriaChartRef) return;
    this.charts['categoria']?.destroy();
    const data = this.categoriasData();
    if (!data.length) return;
    this.charts['categoria'] = new Chart(this.categoriaChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.nombre),
        datasets: [{
          data: data.map((d) => d.total),
          backgroundColor: this.colores,
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }

  exportarExcel() {
    const wb = XLSX.utils.book_new();

    if (this.kpis()) {
      const kpisData = [
        ['Período', 'Lo que vendiste', 'Lo que gastaste', 'Tu ganancia', 'Margen %'],
        ['Hoy', this.kpis().dia.ventas, this.kpis().dia.gastos, this.kpis().dia.ganancia, this.kpis().dia.margen.toFixed(1) + '%'],
        ['Esta semana', this.kpis().semana.ventas, this.kpis().semana.gastos, this.kpis().semana.ganancia, this.kpis().semana.margen.toFixed(1) + '%'],
        ['Este mes', this.kpis().mes.ventas, this.kpis().mes.gastos, this.kpis().mes.ganancia, this.kpis().mes.margen.toFixed(1) + '%'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpisData), 'Resumen');
    }

    if (this.ventasData().length) {
      const ventasRows = [
        ['Fecha', 'Ventas S/', 'Cantidad de pedidos'],
        ...this.ventasData().map((d) => [d.fecha, +d.total, +d.pedidos]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ventasRows), 'Ventas por día');
    }

    if (this.semanalData().length) {
      const semanalRows = [
        ['Semana', 'Desde', 'Hasta', 'Ventas S/', 'Gastos S/', 'Ganancia S/'],
        ...this.semanalData().map((d) => [d.semana, d.desde, d.hasta, d.ventas, d.gastos, d.ganancia]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(semanalRows), 'Por semana');
    }

    if (this.categoriasData().length) {
      const catRows = [
        ['Categoría', 'Tipo', 'Total S/'],
        ...this.categoriasData().map((d) => [d.nombre, d.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto', d.total]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(catRows), 'Detalle gastos');
    }

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), `reporte-puerto-criss-${this.toLocalDateStr()}.xlsx`);
  }

  descargarVentasDetalladasCSV() {
    this.reportesService.exportarCSV(this.filtro.desde, this.filtro.hasta).subscribe({
      next: (blob) => {
        saveAs(blob, `pedidos-detallados-puerto-criss-${this.toLocalDateStr()}.csv`);
      },
      error: () => {},
    });
  }

  inicioMes(): string {
    const d = new Date();
    d.setDate(1);
    return this.toLocalDateStr(d);
  }

  generarResumen() {
    this.loadingIA.set(true);
    this.resumenIA.set('');
    this.reportesService.getResumenIA().subscribe({
      next: ({ data }) => {
        this.resumenIA.set(data.resumen);
        this.loadingIA.set(false);
      },
      error: () => this.loadingIA.set(false),
    });
  }
}

