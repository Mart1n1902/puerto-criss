import { Component, input } from '@angular/core';
import { EstadoPedido } from '../../../core/models/models';

@Component({
  selector: 'app-badge-estado',
  standalone: true,
  template: `
    <span [class]="clases[estado()]" class="px-3 py-1 rounded-full text-xs font-semibold">
      {{ labels[estado()] }}
    </span>
  `,
})
export class BadgeEstadoComponent {
  estado = input.required<EstadoPedido>();

  labels: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pendiente',
    PREPARANDO: 'Preparando',
    LISTO: 'Listo',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
  };

  clases: Record<EstadoPedido, string> = {
    PENDIENTE: 'bg-yellow-400/20 text-yellow-400',
    PREPARANDO: 'bg-blue-400/20 text-blue-400',
    LISTO: 'bg-green-400/20 text-green-400',
    ENTREGADO: 'bg-slate-400/20 text-slate-400',
    CANCELADO: 'bg-red-400/20 text-red-400',
  };
}
