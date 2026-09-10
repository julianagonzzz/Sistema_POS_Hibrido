export type TipoUsuario = 'ADMIN' | 'VENDEDOR' | 'CLIENTE';

export interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  cedula: string;
  tipo_usuario: TipoUsuario;
}

export type Turno = 'MAÑANA' | 'TARDE' | 'NOCHE';

export interface Vendedor {
  id_usuario: string;
  codigo_caja: string; // Ej: 'CAJA-01'
  turno: Turno;
}

export interface Administrador {
  id_usuario: string;
  cargo: string;
  dinero_en_cuenta: number;
}

export interface Cliente {
  id_usuario: string;
  cedula: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export type GeneroProducto = 'Hombre' | 'Mujer' | 'Unisex';
export type TallaProducto = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Única' | '38' | '40' | '42';

export interface Producto {
  id_producto: string;
  nombre: string;
  genero: GeneroProducto;
  talla: TallaProducto;
  cantidad_stock: number;
  precio: number;
  categoria?: string;
  codigo_barras?: string;
}

export type CanalVenta = 'FISICO' | 'VIRTUAL';

export type MedioPago = 'EFECTIVO' | 'DATAFONO' | 'NEQUI' | 'TRANSFERENCIA';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export interface VentaItem {
  id_producto: string;
  nombre: string;
  talla: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id_venta: string;
  fecha: string; // ISO string o formato legible
  medio_pago: MedioPago;
  canal: CanalVenta;
  subtotal: number;
  impuesto: number;
  total: number;
  id_cliente: string;
  cliente_nombre: string;
  cliente_cedula: string;
  id_vendedor: string;
  vendedor_nombre: string;
  codigo_caja: string;
  items: VentaItem[];
  pago_recibido?: number;
  cambio?: number;
  notas?: string;
}
