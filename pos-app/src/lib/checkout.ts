// =====================================================================
// lib/checkout.ts: Lógica de Checkout y Confirmación Online (US_10)
// =====================================================================

import { pool } from "./db";
import { ItemVentaSolicitud } from "./ventas";

export type MedioPagoOnline = "TARJETA_CREDITO" | "PSE" | "TRANSFERENCIA";

export interface PerfilEnvioCliente {
  id_usuario: number;
  nombre: string;
  correo: string;
  cedula: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
}

export interface DatosTarjeta {
  numero: string;
  nombre_titular: string;
  vencimiento: string;
  cvv: string;
  cuotas: number;
}

export interface DatosPSE {
  banco: string;
  tipo_persona: "NATURAL" | "JURIDICA";
  correo_pse: string;
}

export interface DatosTransferencia {
  referencia_comprobante: string;
}

export interface SolicitudCheckoutOnline {
  id_cliente: number;
  direccion: string;
  ciudad: string;
  telefono: string;
  medio_pago: MedioPagoOnline;
  detalles_pago?: {
    tarjeta?: DatosTarjeta;
    pse?: DatosPSE;
    transferencia?: DatosTransferencia;
  };
  items: ItemVentaSolicitud[];
  guardar_datos_envio?: boolean;
}

export interface DetalleVentaOnline {
  id_detalle: number;
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface VentaOnlineConfirmada {
  id_venta: number;
  fecha: string;
  id_cliente: number;
  cliente_nombre: string;
  cliente_correo: string;
  cliente_cedula: string;
  canal: "ONLINE";
  medio_pago: MedioPagoOnline;
  referencia_pago: string;
  direccion_envio: string;
  ciudad_envio: string;
  telefono_envio: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: string;
  detalles: DetalleVentaOnline[];
}

/**
 * CA1: Obtiene los datos del cliente para precargar dirección, ciudad y teléfono.
 */
export async function obtenerPerfilEnvio(id_usuario: number): Promise<PerfilEnvioCliente | null> {
  const consulta = `
    SELECT u.id_usuario, u.nombre, u.correo, u.cedula,
           c.direccion, c.ciudad, c.telefono
    FROM usuario u
    LEFT JOIN cliente c ON c.id_usuario = u.id_usuario
    WHERE u.id_usuario = $1
    LIMIT 1
  `;
  const { rows } = await pool.query<PerfilEnvioCliente>(consulta, [id_usuario]);
  return rows[0] ?? null;
}

/**
 * Simulación de pasarela de pago virtual (CA2).
 * Genera un código de referencia y valida formato de la información.
 */
function simularPasarelaPago(
  medio_pago: MedioPagoOnline,
  detalles?: SolicitudCheckoutOnline["detalles_pago"]
): string {
  const stamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);

  if (medio_pago === "TARJETA_CREDITO") {
    const tarjeta = detalles?.tarjeta;
    if (!tarjeta || !tarjeta.numero || tarjeta.numero.replace(/\s/g, "").length < 15) {
      throw new Error("Número de tarjeta inválido para la transacción.");
    }
    if (!tarjeta.cvv || tarjeta.cvv.length < 3) {
      throw new Error("Código de seguridad (CVV) inválido.");
    }
    return `TC-${stamp}-${random}`;
  }

  if (medio_pago === "PSE") {
    const pse = detalles?.pse;
    if (!pse || !pse.banco || !pse.correo_pse) {
      throw new Error("Debe seleccionar un banco e ingresar su correo registrado en PSE.");
    }
    return `PSE-${stamp}-${random}`;
  }

  if (medio_pago === "TRANSFERENCIA") {
    const ref = detalles?.transferencia?.referencia_comprobante?.trim();
    if (!ref) {
      throw new Error("Debe ingresar el número de comprobante o referencia de su transferencia.");
    }
    return `TRF-${ref.slice(0, 30)}`;
  }

  throw new Error("Modalidad de pago virtual no soportada.");
}

/**
 * CA3, CA4, CA5 y Observaciones:
 * Procesa la venta online dentro de una transacción atómica (BEGIN ... COMMIT):
 * 1. Bloqueo de stock (FOR UPDATE) y verificación de disponibilidad.
 * 2. Descuento atómico de existencias en 'producto'.
 * 3. Inserción de cabecera en 'venta' (canal 'ONLINE', estado 'COMPLETADA', id_vendedor NULL).
 * 4. Inserción de detalles en 'detalle_venta'.
 * 5. Actualización opcional de datos de contacto del cliente.
 */
export async function procesarCheckoutOnline(
  solicitud: SolicitudCheckoutOnline
): Promise<VentaOnlineConfirmada> {
  const {
    id_cliente,
    direccion,
    ciudad,
    telefono,
    medio_pago,
    detalles_pago,
    items,
    guardar_datos_envio = true,
  } = solicitud;

  // Validaciones de datos de entrega (CA1)
  if (!direccion || direccion.trim().length < 5) {
    throw new Error("Debe ingresar una dirección de envío válida.");
  }
  if (!ciudad || ciudad.trim().length < 2) {
    throw new Error("Debe ingresar la ciudad de entrega.");
  }
  if (!telefono || telefono.trim().length < 7) {
    throw new Error("Debe ingresar un teléfono de contacto válido.");
  }
  if (!items || items.length === 0) {
    throw new Error("El carrito de compras no contiene artículos.");
  }

  // Simulación y validación de pasarela de pago (CA2)
  const referencia_pago = simularPasarelaPago(medio_pago, detalles_pago);

  const conexion = await pool.connect();

  try {
    // Observaciones: Obligatoriedad de transacción SQL atómica
    await conexion.query("BEGIN");

    // 1. Obtener y validar existencia del cliente
    const resCliente = await conexion.query<{
      nombre: string;
      correo: string;
      cedula: string;
    }>(
      `SELECT nombre, correo, cedula FROM usuario WHERE id_usuario = $1`,
      [id_cliente]
    );

    if (resCliente.rows.length === 0) {
      throw new Error("El usuario cliente no fue encontrado.");
    }
    const cliente = resCliente.rows[0];

    // 2. Validar productos, stock y calcular totales (CA3)
    let subtotalCalculado = 0;
    const detallesParaInsertar: {
      id_producto: number;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new Error(`Cantidad inválida (${item.cantidad}) para el producto.`);
      }

      // Bloqueo pesimista FOR UPDATE en producto
      const resProd = await conexion.query<{
        id_producto: number;
        nombre: string;
        precio: string | number;
        cantidad_stock: number;
        activo: boolean;
      }>(
        `SELECT id_producto, nombre, precio, cantidad_stock, activo
         FROM producto
         WHERE id_producto = $1
         FOR UPDATE`,
        [item.id_producto]
      );

      if (resProd.rows.length === 0) {
        throw new Error(`El producto con ID ${item.id_producto} no existe.`);
      }

      const prod = resProd.rows[0];
      if (!prod.activo) {
        throw new Error(`El producto "${prod.nombre}" no está disponible para la venta.`);
      }

      // Descuento atómico de existencias con validación de stock
      if (prod.cantidad_stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.cantidad_stock}, solicitado: ${item.cantidad}.`
        );
      }

      const precioUnitario = typeof prod.precio === "string" ? parseFloat(prod.precio) : prod.precio;
      const subtotalItem = precioUnitario * item.cantidad;
      subtotalCalculado += subtotalItem;

      detallesParaInsertar.push({
        id_producto: prod.id_producto,
        nombre: prod.nombre,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        subtotal: subtotalItem,
      });

      // Descontar inventario en la tabla producto (CA3)
      await conexion.query(
        `UPDATE producto
         SET cantidad_stock = cantidad_stock - $1::integer
         WHERE id_producto = $2`,
        [item.cantidad, item.id_producto]
      );
    }

    const impuesto = 0;
    const total = subtotalCalculado + impuesto;

    // 3. Insertar cabecera de venta (CA4)
    // canal = 'ONLINE', estado = 'COMPLETADA', codigo_caja = 'ONLINE'
    const resVenta = await conexion.query<{
      id_venta: number;
      fecha: string;
      estado: string;
    }>(
      `INSERT INTO venta (
        id_cliente, id_vendedor, codigo_caja, medio_pago, canal,
        subtotal, impuesto, total, estado,
        monto_recibido, cambio, referencia_pago,
        direccion_envio, ciudad_envio, telefono_envio
       ) VALUES ($1, NULL, 'ONLINE', $2, 'ONLINE', $3, $4, $5, 'COMPLETADA', $6, 0, $7, $8, $9, $10)
       RETURNING id_venta, fecha, estado`,
      [
        id_cliente,
        medio_pago,
        subtotalCalculado,
        impuesto,
        total,
        total, // monto recibido exacto
        referencia_pago,
        direccion.trim(),
        ciudad.trim(),
        telefono.trim(),
      ]
    );

    const ventaCreada = resVenta.rows[0];

    // 4. Insertar registros en detalle_venta (CA5)
    const detallesCreados: DetalleVentaOnline[] = [];
    for (const d of detallesParaInsertar) {
      const resDetalle = await conexion.query<{ id_detalle: number }>(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_detalle`,
        [ventaCreada.id_venta, d.id_producto, d.cantidad, d.precio_unitario, d.subtotal]
      );

      detallesCreados.push({
        id_detalle: resDetalle.rows[0].id_detalle,
        id_producto: d.id_producto,
        nombre: d.nombre,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
      });
    }

    // 5. Actualizar o persistir datos de contacto en la tabla cliente si se solicitó (CA1)
    if (guardar_datos_envio) {
      await conexion.query(
        `INSERT INTO cliente (id_usuario, direccion, ciudad, telefono)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_usuario) DO UPDATE
         SET direccion = EXCLUDED.direccion,
             ciudad = EXCLUDED.ciudad,
             telefono = EXCLUDED.telefono`,
        [id_cliente, direccion.trim(), ciudad.trim(), telefono.trim()]
      );
    }

    // Confirmar transacción de forma atómica
    await conexion.query("COMMIT");

    return {
      id_venta: ventaCreada.id_venta,
      fecha: ventaCreada.fecha,
      id_cliente,
      cliente_nombre: cliente.nombre,
      cliente_correo: cliente.correo,
      cliente_cedula: cliente.cedula,
      canal: "ONLINE",
      medio_pago,
      referencia_pago,
      direccion_envio: direccion.trim(),
      ciudad_envio: ciudad.trim(),
      telefono_envio: telefono.trim(),
      subtotal: subtotalCalculado,
      impuesto,
      total,
      estado: ventaCreada.estado,
      detalles: detallesCreados,
    };
  } catch (error) {
    await conexion.query("ROLLBACK");
    throw error;
  } finally {
    conexion.release();
  }
}
