import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito, Producto, ItemPersonalizacion } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private _items = signal<ItemCarrito[]>(this.cargarStorage());
  private _mesaQR = signal<string | null>(this.cargarMesaQRStorage());

  readonly items = this._items.asReadonly();
  readonly mesaQR = this._mesaQR.asReadonly();

  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.producto.precio_actual * i.cantidad, 0)
  );

  readonly cantidad = computed(() =>
    this._items().reduce((sum, i) => sum + i.cantidad, 0)
  );

  fijarMesaQR(numeroMesa: string | null) {
    this._mesaQR.set(numeroMesa);
    if (numeroMesa) {
      localStorage.setItem('puerto_criss_mesa_qr', numeroMesa);
    } else {
      localStorage.removeItem('puerto_criss_mesa_qr');
    }
  }

  agregar(producto: Producto, personalizacion?: ItemPersonalizacion) {
    const p = personalizacion || {};
    const idItem = `${producto.id}_${p.picante || ''}_${p.guarnicion || ''}_${p.notaItem || ''}`;

    this._items.update((items) => {
      const existe = items.find((i) => (i.idItem || String(i.producto.id)) === idItem);
      if (existe) {
        return items.map((i) =>
          (i.idItem || String(i.producto.id)) === idItem ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...items, { idItem, producto, cantidad: 1, personalizacion }];
    });
    this.guardarStorage();
  }

  actualizar(idItemOrProdId: string | number, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminar(idItemOrProdId);
      return;
    }
    this._items.update((items) =>
      items.map((i) =>
        (i.idItem === idItemOrProdId || i.producto.id === idItemOrProdId)
          ? { ...i, cantidad }
          : i
      )
    );
    this.guardarStorage();
  }

  eliminar(idItemOrProdId: string | number) {
    this._items.update((items) =>
      items.filter((i) => i.idItem !== idItemOrProdId && i.producto.id !== idItemOrProdId)
    );
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

  private cargarMesaQRStorage(): string | null {
    try {
      return localStorage.getItem('puerto_criss_mesa_qr') || null;
    } catch {
      return null;
    }
  }
}

