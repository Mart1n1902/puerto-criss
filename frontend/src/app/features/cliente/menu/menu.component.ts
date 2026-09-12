import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosService } from '../../../core/services/productos.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { SocketService } from '../../../core/services/socket.service';
import { Producto, Categoria, ItemPersonalizacion } from '../../../core/models/models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <!-- Banner de Mesa Asignada vía QR -->
    @if (carrito.mesaQR()) {
      <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 shadow-md flex items-center justify-between sticky top-0 z-40">
        <div class="flex items-center gap-2 text-xs sm:text-sm font-bold max-w-2xl mx-auto w-full">
          <span class="text-xl">📍</span>
          <span>Estás en la <strong>Mesa {{ carrito.mesaQR() }}</strong> · Tu orden irá directo a tu mesa</span>
        </div>
      </div>
    }

    <!-- Hero banner -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 text-white px-4 py-8">
      <div class="max-w-2xl mx-auto text-center">
        <p class="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-2">Fresco del día</p>
        <h1 class="text-3xl font-black mb-1">Nuestro Menú</h1>
        <p class="text-slate-400 text-sm">Elige tu plato favorito, personaliza el picor y lo preparamos al momento</p>
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
            placeholder="¿Qué se te antoja hoy? (Ceviche, Chicharrón, etc.)"
            class="flex-1 py-4 text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent text-sm sm:text-base"
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
              class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md"
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
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-bold text-slate-800 text-base leading-tight">{{ producto.nombre }}</h3>
                    @if (esPlatoMarino(producto)) {
                      <span class="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                        🐟 Marino
                      </span>
                    }
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
                    <button
                      (click)="abrirModalPersonalizar(producto)"
                      class="w-10 h-10 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md shadow-orange-200 transition-colors"
                      title="Personalizar y agregar"
                    >
                      <app-icon name="plus" [size]="18" />
                    </button>
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

    <!-- Modal de Personalización de Plato -->
    @if (productoSeleccionado()) {
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-bold text-cyan-600 uppercase tracking-wider">Personaliza tu plato</span>
              <h3 class="text-xl font-black text-slate-900">{{ productoSeleccionado()!.nombre }}</h3>
              <p class="text-sm font-bold text-slate-500">S/ {{ productoSeleccionado()!.precio_actual }}</p>
            </div>
            <button (click)="cerrarModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center">
              ✕
            </button>
          </div>

          <!-- Nivel de Picor -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">🌶️ Nivel de Picante</label>
            <div class="grid grid-cols-2 gap-2">
              @for (pic of opcionesPicante; track pic) {
                <button
                  type="button"
                  (click)="picanteSeleccionado = pic"
                  [class]="picanteSeleccionado === pic ? 'border-2 border-orange-500 bg-orange-50 text-orange-800 font-bold' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'"
                  class="py-2.5 px-3 rounded-xl text-xs transition-all text-center"
                >
                  {{ pic }}
                </button>
              }
            </div>
          </div>

          <!-- Guarnición / Preferencia -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">🍠 Guarnición / Preferencia</label>
            <div class="grid grid-cols-2 gap-2">
              @for (guar of opcionesGuarnicion; track guar) {
                <button
                  type="button"
                  (click)="guarnicionSeleccionada = guar"
                  [class]="guarnicionSeleccionada === guar ? 'border-2 border-cyan-500 bg-cyan-50 text-cyan-800 font-bold' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'"
                  class="py-2.5 px-3 rounded-xl text-xs transition-all text-center"
                >
                  {{ guar }}
                </button>
              }
            </div>
          </div>

          <!-- Nota especial -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">📝 Nota para cocina (opcional)</label>
            <input
              type="text"
              [(ngModel)]="notaItem"
              placeholder="Ej. Sin cebolla, limón suave..."
              class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 bg-slate-50"
            />
          </div>

          <!-- Botón Confirmar Agregar -->
          <div class="pt-2">
            <button
              (click)="confirmarAgregar()"
              class="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <span>Agregar a mi orden</span>
              <span>·</span>
              <span>S/ {{ productoSeleccionado()!.precio_actual }}</span>
            </button>
          </div>

        </div>
      </div>
    }

    <!-- Barra flotante del carrito -->
    @if (carrito.cantidad() > 0) {
      <div class="fixed bottom-0 left-0 right-0 p-4 z-40">
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
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosService);
  private socketService = inject(SocketService);
  carrito = inject(CarritoService);

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  categoriaActiva = signal<number | null>(null);
  busqueda = '';
  loading = signal(true);
  private sub = new Subscription();

  // Personalizador
  productoSeleccionado = signal<Producto | null>(null);
  opcionesPicante = ['Poco picante', 'Punto medio (Recomendado)', 'Bien picante / Fuego', 'Sin ají'];
  opcionesGuarnicion = ['Clásico (Camote y choclo)', 'Doble canchita', 'Con yuca frita', 'Sin cebolla'];
  picanteSeleccionado = 'Punto medio (Recomendado)';
  guarnicionSeleccionada = 'Clásico (Camote y choclo)';
  notaItem = '';

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
    // Detectar parámetro ?mesa=X desde QR
    this.route.queryParams.subscribe((params) => {
      if (params['mesa']) {
        this.carrito.fijarMesaQR(String(params['mesa']));
      }
    });

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
    this.productosService.getProductos(false).subscribe({
      next: ({ data }) => { this.productos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  esPlatoMarino(producto: Producto): boolean {
    const cat = producto.categoria?.nombre?.toLowerCase() || '';
    const nom = producto.nombre.toLowerCase();
    return cat.includes('ceviche') || cat.includes('mariscos') || nom.includes('ceviche') || nom.includes('leche de tigre') || nom.includes('chicharrón');
  }

  abrirModalPersonalizar(producto: Producto) {
    this.productoSeleccionado.set(producto);
    this.picanteSeleccionado = 'Punto medio (Recomendado)';
    this.guarnicionSeleccionada = 'Clásico (Camote y choclo)';
    this.notaItem = '';
  }

  cerrarModal() {
    this.productoSeleccionado.set(null);
  }

  confirmarAgregar() {
    const prod = this.productoSeleccionado();
    if (!prod) return;

    const personalizacion: ItemPersonalizacion = {
      picante: this.picanteSeleccionado,
      guarnicion: this.guarnicionSeleccionada,
      notaItem: this.notaItem.trim() || undefined,
    };

    this.carrito.agregar(prod, personalizacion);
    this.cerrarModal();
  }
}

