import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, Producto } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  private nuevoPedidoSubject = new Subject<Pedido>();
  private cambioEstadoSubject = new Subject<Pedido>();
  private productoActualizadoSubject = new Subject<Producto>();

  nuevoPedido$ = this.nuevoPedidoSubject.asObservable();
  cambioEstado$ = this.cambioEstadoSubject.asObservable();
  productoActualizado$ = this.productoActualizadoSubject.asObservable();

  constructor() {
    const socketUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Conectado a WebSockets en tiempo real:', this.socket.id);
      this.unirseAStaff();
    });

    this.socket.on('pedido:nuevo', (pedido: Pedido) => {
      this.nuevoPedidoSubject.next(pedido);
    });

    this.socket.on('pedido:cambio_estado', (pedido: Pedido) => {
      this.cambioEstadoSubject.next(pedido);
    });

    this.socket.on('producto:disponibilidad', (producto: Producto) => {
      this.productoActualizadoSubject.next(producto);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado de WebSockets');
    });
  }

  unirseAStaff() {
    const token = localStorage.getItem('token');
    if (token) {
      this.socket.emit('join:staff', token);
    }
  }

  unirseAPedido(codigoOrId: string | number) {
    if (codigoOrId) {
      this.socket.emit('join:pedido', codigoOrId);
    }
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }
}

