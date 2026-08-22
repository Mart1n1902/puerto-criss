import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Producto, Categoria } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getProductos(soloDisponibles = true) {
    return this.http.get<{ success: boolean; data: Producto[] }>(
      `${this.api}/productos?disponibles=${soloDisponibles}`
    );
  }

  getCategorias() {
    return this.http.get<{ success: boolean; data: Categoria[] }>(
      `${this.api}/categorias`
    );
  }

  toggleDisponible(id: number) {
    return this.http.patch<{ success: boolean; data: Producto }>(
      `${this.api}/productos/${id}/toggle-disponible`,
      {}
    );
  }
}
