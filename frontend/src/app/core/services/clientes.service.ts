import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ClienteLookup {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string | null;
  referencia: string | null;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.api}/clientes`);
  }

  getById(id: number) {
    return this.http.get<{ success: boolean; data: any }>(`${this.api}/clientes/${id}`);
  }

  lookup(telefono: string) {
    return this.http.get<{ success: boolean; data: ClienteLookup | null }>(
      `${this.api}/clientes/lookup?telefono=${encodeURIComponent(telefono)}`
    );
  }
}
