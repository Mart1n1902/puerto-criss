export type Rol = 'ADMIN' | 'COCINA' | 'MOZO';

export interface User {
  id: number;
  nombre: string;
  rol: Rol;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type EstadoPedido = 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
export type TipoPedido = 'DELIVERY' | 'RECOJO' | 'MESA';
export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'TARJETA';
export type EstadoMesa = 'LIBRE' | 'OCUPADA' | 'RESERVADA';

export interface Categoria {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_actual: number;
  imagen_url?: string;
  disponible: boolean;
  categoria: Categoria;
}

export interface DetallePedido {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  producto: { id: number; nombre: string };
}

export interface Pedido {
  id: number;
  codigo?: string;
  tipo: TipoPedido;
  estado: EstadoPedido;
  direccion?: string;
  referencia?: string;
  notas?: string;
  mesa_id?: number;
  createdAt: string;
  cliente?: { nombre: string; telefono?: string };
  mesa?: { id: number; numero: string };
  detalles: DetallePedido[];
  pagos: { metodo: MetodoPago; monto: number }[];
}

export interface Mesa {
  id: number;
  numero: string;
  estado: EstadoMesa;
}

export interface ItemPersonalizacion {
  picante?: string;
  guarnicion?: string;
  notaItem?: string;
}

export interface ItemCarrito {
  idItem?: string;
  producto: Producto;
  cantidad: number;
  personalizacion?: ItemPersonalizacion;
}

