import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Mesa } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MesasService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<{ success: boolean; data: Mesa[] }>(`${this.api}/mesas`);
  }

  update(id: number, data: Partial<Mesa>) {
    return this.http.put<{ success: boolean; data: Mesa }>(`${this.api}/mesas/${id}`, data);
  }

  create(data: { numero: string; estado?: string }) {
    return this.http.post<{ success: boolean; data: Mesa }>(`${this.api}/mesas`, data);
  }
}
