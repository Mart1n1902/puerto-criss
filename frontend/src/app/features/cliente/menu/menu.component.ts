import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../../core/services/productos.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { SocketService } from '../../../core/services/socket.service';
import { Producto, Categoria } from '../../../core/models/models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <!-- Hero banner -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 text-white px-4 py-8">
      <div class="max-w-2xl mx-auto text-center">
        <p class="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-2">Fresco del día</p>
        <h1 class="text-3xl font-black mb-1">Nuestro Menú</h1>
        <p class="text-slate-400 text-sm">Elige tu plato favorito y lo preparamos al momento</p>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 pb-32">

      <!-- Búsqueda -->
      <div class="relative -mt-5 mb-6">
        <div class="bg-white rounded-2xl shadow-lg flex items-center px-4 gap-3 border border-slate-100">
          <span class="text-slate-400"><app-icon name="search" [size]="18" /></span>
          <input
            type="text"
            [(ngModel)]="busqueda"
            placeholder="¿Qué se te antoja hoy?"
            class="flex-1 py-4 text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          @if (busqueda) {
            <button (click)="busqueda = ''" class="text-slate-400 hover:text-slate-600">
              <app-icon name="x" [size]="16" />
            </button>
          }
        </div>
      </div>

      <!-- Categorías -->
      <div class="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-4 px-4">
        <button
          (click)="categoriaActiva.set(null)"
          [class]="!categoriaActiva() ? 'bg-cyan-500 text-slate-900 font-black shadow-lg shadow-cyan-200' : 'bg-white text-slate-600 border border-slate-200 font-semibold'"
          class="flex-shrink-0 px-5 py-2.5 rounded-full text-sm transition-all"
        >
          Todos
        </button>
        @for (cat of categorias(); track cat.id) {
          <button
            (click)="categoriaActiva.set(cat.id)"
            [class]="categoriaActiva() === cat.id ? 'bg-cyan-500 text-slate-900 font-black shadow-lg shadow-cyan-200' : 'bg-white text-slate-600 border border-slate-200 font-semibold'"
            class="flex-shrink-0 px-5 py-2.5 rounded-full text-sm transition-all whitespace-nowrap"
          >
            {{ cat.nombre }}
          </button>
        }
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-2xl h-28 animate-pulse"></div>
          }
        </div>
      }

      <!-- Lista de productos -->
      @if (!loading()) {
        @if (productosFiltrados().length === 0) {
          <div class="text-center py-20 text-slate-400">
            <div class="flex justify-center mb-3 text-slate-300">
              <app-icon name="search" [size]="48" />
            </div>
            <p class="font-medium">No encontramos ese plato</p>
            <button (click)="busqueda = ''; categoriaActiva.set(null)" class="text-cyan-500 text-sm mt-2 hover:underline font-bold">
              Ver todo el menú
            </button>
          </div>
        }

        <div class="space-y-3">
          @for (producto of productosFiltrados(); track producto.id) {
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all"
              [class.opacity-75]="!producto.disponible"
            >
              <div class="flex items-center gap-4 p-4">

                <!-- Imagen -->
                <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-cyan-50 to-slate-100 flex items-center justify-center relative">
                  @if (producto.imagen_url) {
                    <img [src]="producto.imagen_url" [alt]="producto.nombre" class="w-full h-full object-cover" />
                  } @else {
                    <span class="text-slate-300"><app-icon name="utensils" [size]="32" /></span>
                  }
                  @if (!producto.disponible) {
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span class="text-xs font-black text-white bg-red-600 px-1.5 py-0.5 rounded shadow">AGOTADO</span>
                    </div>
                  }
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-slate-800 text-base leading-tight">{{ producto.nombre }}</h3>
                    @if (!producto.disponible) {
                      <span class="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                        Agotado por hoy
                      </span>
                    }
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5 mb-1.5">{{ producto.categoria.nombre }}</p>
                  @if (producto.descripcion) {
                    <p class="text-xs text-slate-500 line-clamp-1 mb-1">{{ producto.descripcion }}</p>
                  }
                  <p class="text-cyan-600 font-black text-lg">S/ {{ producto.precio_actual }}</p>
                </div>

                <!-- Acción -->
                <div class="flex-shrink-0">
                  @if (producto.disponible) {
                    @if (cantidadEnCarrito(producto.id) === 0) {
                      <button
                        (click)="agregar(producto)"
                        class="w-10 h-10 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md shadow-orange-200 transition-colors"
                        title="Agregar al pedido"
                      >
                        <app-icon name="plus" [size]="18" />
                      </button>
                    } @else {
                      <div class="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
                        <button
                          (click)="actualizar(producto.id, cantidadEnCarrito(producto.id) - 1)"
                          class="w-7 h-7 bg-white rounded-full text-slate-700 flex items-center justify-center shadow-sm"
                        ><app-icon name="minus" [size]="14" /></button>
                        <span class="font-black text-slate-800 w-4 text-center text-sm">{{ cantidadEnCarrito(producto.id) }}</span>
                        <button
                          (click)="agregar(producto)"
                          class="w-7 h-7 bg-orange-500 rounded-full text-white flex items-center justify-center shadow-sm"
                        ><app-icon name="plus" [size]="14" /></button>
                      </div>
                    }
                  } @else {
                    <span class="text-xs text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded-lg">
                      No disponible
                    </span>
                  }
                </div>

              </div>
            </div>
          }
        </div>
      }

    </div>

    <!-- Barra flotante del carrito -->
    @if (carrito.cantidad() > 0) {
      <div class="fixed bottom-0 left-0 right-0 p-4 z-50">
        <a
          routerLink="/carrito"
          class="flex items-center justify-between bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-bold px-5 py-4 rounded-2xl shadow-2xl shadow-orange-300 transition-colors max-w-2xl mx-auto"
        >
          <span class="bg-orange-600 rounded-xl px-2.5 py-1 text-sm font-black">{{ carrito.cantidad() }}</span>
          <span class="flex items-center gap-2"><app-icon name="cart" [size]="18" /> Ver mi pedido</span>
          <span class="font-black">S/ {{ carrito.total().toFixed(2) }}</span>
        </a>
      </div>
    }
  `,
})
export class MenuComponent implements OnInit, OnDestroy {
  private productosService = inject(ProductosService);
  private socketService = inject(SocketService);
  carrito = inject(CarritoService);

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  categoriaActiva = signal<number | null>(null);
  busqueda = '';
  loading = signal(true);
  private sub = new Subscription();

  productosFiltrados = computed(() => {
    let lista = this.productos();
    if (this.categoriaActiva()) lista = lista.filter((p) => p.categoria.id === this.categoriaActiva());
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(q));
    }
    return lista;
  });

  ngOnInit() {
    this.productosService.getCategorias().subscribe(({ data }) => this.categorias.set(data));
    this.cargar();

    // Escuchar cambios de disponibilidad en vivo
    this.sub.add(
      this.socketService.productoActualizado$.subscribe((prodActualizado) => {
        this.productos.update((lista) =>
          lista.map((p) => (p.id === prodActualizado.id ? { ...p, disponible: prodActualizado.disponible } : p))
        );
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  cargar() {
    // Cargar todos los productos para mostrar también los agotados con etiqueta
    this.productosService.getProductos(false).subscribe({
      next: ({ data }) => { this.productos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  agregar(producto: Producto) {
    if (!producto.disponible) return;
    this.carrito.agregar(producto);
  }

  actualizar(id: number, cantidad: number) { this.carrito.actualizar(id, cantidad); }

  cantidadEnCarrito(productoId: number): number {
    return this.carrito.items().find((i) => i.producto.id === productoId)?.cantidad ?? 0;
  }
}
