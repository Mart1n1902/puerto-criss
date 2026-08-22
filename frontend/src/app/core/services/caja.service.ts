import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getSesionActiva() {
    return this.http.get<{ success: boolean; data: any }>(`${this.api}/caja/activa`);
  }

  getHistorial() {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.api}/caja/historial`);
  }

  abrir(monto_inicial: number) {
    return this.http.post<{ success: boolean; data: any }>(`${this.api}/caja/abrir`, { monto_inicial });
  }

  cerrar(id: number) {
    return this.http.patch<{ success: boolean; data: any }>(`${this.api}/caja/${id}/cerrar`, {});
  }

  getMovimientos(sesionId: number) {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.api}/movimientos/sesion/${sesionId}`);
  }

  getMovimientosPorRango(desde: string, hasta: string) {
    return this.http.get<{ success: boolean; data: any[] }>(
      `${this.api}/movimientos/rango?desde=${desde}&hasta=${hasta}`
    );
  }

  getCategorias() {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.api}/movimientos/categorias`);
  }

  crearMovimiento(data: any) {
    return this.http.post<{ success: boolean; data: any }>(`${this.api}/movimientos`, data);
  }

  crearCategoria(data: any) {
    return this.http.post<{ success: boolean; data: any }>(`${this.api}/movimientos/categorias`, data);
  }
}
