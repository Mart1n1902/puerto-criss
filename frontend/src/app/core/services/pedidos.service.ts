import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pedido } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  crear(body: any) {
    return this.http.post<{ success: boolean; data: Pedido }>(`${this.api}/pedidos`, body);
  }

  getById(idOrCodigo: number | string) {
    return this.http.get<{ success: boolean; data: Pedido }>(`${this.api}/pedidos/${idOrCodigo}`);
  }

  getByCodigo(codigo: string) {
    return this.http.get<{ success: boolean; data: Pedido }>(`${this.api}/pedidos/codigo/${codigo}`);
  }

  getAll(params: any = {}) {
    return this.http.get<{ success: boolean; data: Pedido[] }>(`${this.api}/pedidos`, { params });
  }

  cambiarEstado(id: number, estado: string) {
    return this.http.patch<{ success: boolean; data: Pedido }>(
      `${this.api}/pedidos/${id}/estado`, { estado }
    );
  }

  registrarPago(id: number, body: any) {
    return this.http.post(`${this.api}/pedidos/${id}/pago`, body);
  }
}
