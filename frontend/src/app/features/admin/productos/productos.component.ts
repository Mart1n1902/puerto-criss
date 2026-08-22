import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../core/services/productos.service';
import { Producto, Categoria } from '../../../core/models/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">

      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800">Productos</h1>
        <button
          (click)="abrirModal()"
          class="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      <!-- Grid de productos -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (producto of productos(); track producto.id) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="h-36 bg-gradient-to-br from-cyan-50 to-slate-100 flex items-center justify-center">
              @if (producto.imagen_url) {
                <img [src]="producto.imagen_url" [alt]="producto.nombre" class="h-full w-full object-cover" />
              } @else {
                <span class="text-5xl">🦐</span>
              }
            </div>
            <div class="p-4">
              <div class="flex justify-between items-start mb-1">
                <h3 class="font-semibold text-slate-800">{{ producto.nombre }}</h3>
                <span class="text-cyan-600 font-bold">S/ {{ producto.precio_actual }}</span>
              </div>
              <p class="text-xs text-slate-400 mb-3">{{ producto.categoria.nombre }}</p>
              <div class="flex items-center justify-between">
                <span [class]="producto.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="text-xs font-medium px-2 py-1 rounded-full">
                  {{ producto.disponible ? 'Disponible' : 'No disponible' }}
                </span>
                <div class="flex gap-2">
                  <button
                    (click)="editar(producto)"
                    class="text-slate-400 hover:text-cyan-500 transition-colors text-sm"
                  >✏️</button>
                  <button
                    (click)="toggleDisponible(producto)"
                    class="text-slate-400 hover:text-red-500 transition-colors text-sm"
                  >{{ producto.disponible ? '🚫' : '✅' }}</button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

    </div>

    <!-- Modal -->
    @if (modalAbierto()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 flex-shrink-0">
            <h2 class="font-black text-slate-800 text-lg">{{ editando() ? 'Editar' : 'Nuevo' }} producto</h2>
            <button (click)="cerrarModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-lg">✕</button>
          </div>
          <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Nombre del plato *</label>
              <input type="text" [(ngModel)]="form.nombre" placeholder="Ej: Ceviche Mixto"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Categoría *</label>
              <select [(ngModel)]="form.categoria_id"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white">
                @for (cat of categorias(); track cat.id) {
                  <option [value]="cat.id">{{ cat.nombre }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Precio en Soles (S/) *</label>
              <input type="number" [(ngModel)]="form.precio_actual" step="0.50" min="0" placeholder="0.00"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Descripción (opcional)</label>
              <textarea [(ngModel)]="form.descripcion" rows="2" placeholder="Ingredientes o detalles del plato"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"></textarea>
            </div>

            @if (error()) {
              <p class="text-red-500 text-xs font-semibold bg-red-50 p-2 rounded-lg border border-red-200">{{ error() }}</p>
            }

          </div>
          <div class="flex gap-3 p-5 sm:p-6 border-t border-slate-100 flex-shrink-0 bg-slate-50">
            <button (click)="cerrarModal()" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-xs sm:text-sm">
              Cancelar
            </button>
            <button (click)="guardar()" [disabled]="guardando()"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-black py-2.5 rounded-xl transition-all shadow-md shadow-cyan-200 text-xs sm:text-sm">
              {{ guardando() ? 'Guardando...' : 'Guardar plato' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProductosComponent implements OnInit {
  private productosService = inject(ProductosService);
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  modalAbierto = signal(false);
  editando = signal<Producto | null>(null);
  guardando = signal(false);
  error = signal('');

  form: any = { nombre: '', categoria_id: '', precio_actual: 0, descripcion: '' };

  ngOnInit() {
    this.productosService.getCategorias().subscribe(({ data }) => this.categorias.set(data));
    this.cargar();
  }

  cargar() {
    this.productosService.getProductos(false).subscribe(({ data }) => this.productos.set(data));
  }

  abrirModal() {
    this.editando.set(null);
    this.form = { nombre: '', categoria_id: this.categorias()[0]?.id, precio_actual: 0, descripcion: '' };
    this.error.set('');
    this.modalAbierto.set(true);
  }

  editar(producto: Producto) {
    this.editando.set(producto);
    this.form = {
      nombre: producto.nombre,
      categoria_id: producto.categoria.id,
      precio_actual: producto.precio_actual,
      descripcion: producto.descripcion || '',
    };
    this.error.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal() { this.modalAbierto.set(false); }

  guardar() {
    if (!this.form.nombre || !this.form.precio_actual) {
      this.error.set('Nombre y precio son requeridos');
      return;
    }
    this.guardando.set(true);
    const req = this.editando()
      ? this.http.put(`${this.api}/productos/${this.editando()!.id}`, this.form)
      : this.http.post(`${this.api}/productos`, this.form);

    req.subscribe({
      next: () => { this.cerrarModal(); this.cargar(); this.guardando.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Error al guardar'); this.guardando.set(false); },
    });
  }

  toggleDisponible(producto: Producto) {
    this.http.put(`${this.api}/productos/${producto.id}`, { disponible: !producto.disponible }).subscribe({
      next: () => this.cargar(),
    });
  }
}
