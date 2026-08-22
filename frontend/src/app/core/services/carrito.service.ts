import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito, Producto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private _items = signal<ItemCarrito[]>(this.cargarStorage());

  readonly items = this._items.asReadonly();

  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.producto.precio_actual * i.cantidad, 0)
  );

  readonly cantidad = computed(() =>
    this._items().reduce((sum, i) => sum + i.cantidad, 0)
  );

  agregar(producto: Producto) {
    this._items.update((items) => {
      const existe = items.find((i) => i.producto.id === producto.id);
      if (existe) {
        return items.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...items, { producto, cantidad: 1 }];
    });
    this.guardarStorage();
  }

  actualizar(productoId: number, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminar(productoId);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i))
    );
    this.guardarStorage();
  }

  eliminar(productoId: number) {
    this._items.update((items) => items.filter((i) => i.producto.id !== productoId));
    this.guardarStorage();
  }

  limpiar() {
    this._items.set([]);
    localStorage.removeItem('carrito');
  }

  private guardarStorage() {
    localStorage.setItem('carrito', JSON.stringify(this._items()));
  }

  private cargarStorage(): ItemCarrito[] {
    try {
      const raw = localStorage.getItem('carrito');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
