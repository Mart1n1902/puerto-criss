import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getDashboard() {
    return this.http.get<{ success: boolean; data: any }>(`${this.api}/reportes/dashboard`);
  }

  getKpis() {
    return this.http.get<{ success: boolean; data: any }>(`${this.api}/reportes/kpis`);
  }

  getVentasPorDia(dias = 7) {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.api}/reportes/ventas?dias=${dias}`);
  }

  getComparativaSemanal(semanas = 4) {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.api}/reportes/comparativa?semanas=${semanas}`);
  }

  getGastosPorCategoria(desde: string, hasta: string) {
    return this.http.get<{ success: boolean; data: any[] }>(
      `${this.api}/reportes/gastos-categoria?desde=${desde}&hasta=${hasta}`
    );
  }

  getResumenIA() {
    return this.http.get<{ success: boolean; data: { resumen: string } }>(
      `${this.api}/reportes/resumen-ia`
    );
  }
}
