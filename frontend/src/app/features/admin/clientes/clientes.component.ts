import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clientes-admin',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="space-y-6">

      <h1 class="text-2xl font-bold text-slate-800">Clientes</h1>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th class="px-5 py-3 text-left">#</th>
                <th class="px-5 py-3 text-left">Nombre</th>
                <th class="px-5 py-3 text-left">Teléfono</th>
                <th class="px-5 py-3 text-left">Documento</th>
                <th class="px-5 py-3 text-left">Registrado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr><td colspan="5" class="px-5 py-4"><div class="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                }
              }
              @for (cliente of clientes(); track cliente.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-5 py-4 text-slate-400">{{ cliente.id }}</td>
                  <td class="px-5 py-4 font-medium text-slate-800">{{ cliente.nombre }}</td>
                  <td class="px-5 py-4 text-slate-600">{{ cliente.telefono || '—' }}</td>
                  <td class="px-5 py-4 text-slate-600">{{ cliente.documento || '—' }}</td>
                  <td class="px-5 py-4 text-slate-400 text-xs">{{ cliente.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
              @if (!loading() && clientes().length === 0) {
                <tr><td colspan="5" class="text-center py-12 text-slate-400">No hay clientes registrados</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
})
export class ClientesAdminComponent implements OnInit {
  private http = inject(HttpClient);
  clientes = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/clientes`).subscribe({
      next: ({ data }) => { this.clientes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
