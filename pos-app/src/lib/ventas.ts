import { pool } from "./db";

export type MedioPago = "EFECTIVO" | "DATAFONO" | "NEQUI" | "TRANSFERENCIA";

export interface ItemVentaSolicitud {
  id_producto: number;
  cantidad: number;
}

export interface DetalleVentaRegistrado {
  id_detalle: number;
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface VentaCompleta {
  id_venta: number;
  fecha: string;
  id_cliente: number;
  cliente_nombre: string;
  cliente_cedula: string;
  cliente_correo: string;
  id_vendedor: number;
  vendedor_nombre: string;
  codigo_caja: string;
  medio_pago: MedioPago;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: string;
  detalles: DetalleVentaRegistrado[];
}

export interface ResumenVentaFila {
  id_venta: number;
  fecha: string;
  cliente_nombre: string;
  cliente_cedula: string;
  codigo_caja: string;
  medio_pago: MedioPago;
  total: string | number;
  cantidad_items: string | number;
}

/**
 * Registra una venta completa en la base de datos de manera transaccional:
 * 1. Verifica stock disponible de cada producto.
 * 2. Inserta la cabecera en venta.
 * 3. Inserta los items en detalle_venta.
 * 4. Descuenta el inventario en producto.
 * 5. Confirma (COMMIT).
 */
export async function registrarVenta(datos: {
  id_cliente: number;
  id_vendedor: number;
  codigo_caja: string;
  medio_pago: MedioPago;
  items: ItemVentaSolicitud[];
}): Promise<VentaCompleta> {
  if (!datos.items || datos.items.length === 0) {
    throw new Error("La venta debe contener al menos un producto.");
  }

  const conexion = await pool.connect();
  try {
    await conexion.query("BEGIN");

    // 1. Obtener datos del cliente
    const resCliente = await conexion.query<{
      nombre: string;
      correo: string;
      cedula: string;
    }>(
      `SELECT nombre, correo, cedula FROM usuario WHERE id_usuario = $1`,
      [datos.id_cliente]
    );
    if (resCliente.rows.length === 0) {
      throw new Error("El cliente seleccionado no existe.");
    }
    const cliente = resCliente.rows[0];

    // 2. Obtener datos del vendedor
    const resVendedor = await conexion.query<{ nombre: string }>(
      `SELECT nombre FROM usuario WHERE id_usuario = $1`,
      [datos.id_vendedor]
    );
    const vendedorNombre = resVendedor.rows[0]?.nombre || "Vendedor";

    // 3. Validar productos, calcular subtotales y descontar stock
    let subtotalCalculado = 0;
    const detallesParaInsertar: {
      id_producto: number;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }[] = [];

    for (const item of datos.items) {
      if (item.cantidad <= 0) {
        throw new Error(`Cantidad inválida (${item.cantidad}) para el producto ID ${item.id_producto}.`);
      }

      // Consulta con bloqueo FOR UPDATE para evitar condiciones de carrera en stock
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
        throw new Error(`El producto "${prod.nombre}" no está activo.`);
      }

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

      // Descontar inventario
      await conexion.query(
        `UPDATE producto
         SET cantidad_stock = cantidad_stock - $1
         WHERE id_producto = $2`,
        [item.cantidad, item.id_producto]
      );
    }

    const impuesto = 0; // Se puede configurar si aplica IVA
    const total = subtotalCalculado + impuesto;

    // 4. Insertar cabecera de venta
    const resVenta = await conexion.query<{
      id_venta: number;
      fecha: string;
      estado: string;
    }>(
      `INSERT INTO venta (
         id_cliente, id_vendedor, codigo_caja, medio_pago, canal,
         subtotal, impuesto, total, estado
       ) VALUES ($1, $2, $3, $4, 'FISICO', $5, $6, $7, 'COMPLETADA')
       RETURNING id_venta, fecha, estado`,
      [
        datos.id_cliente,
        datos.id_vendedor,
        datos.codigo_caja,
        datos.medio_pago,
        subtotalCalculado,
        impuesto,
        total,
      ]
    );

    const ventaCreada = resVenta.rows[0];

    // 5. Insertar detalles de la venta
    const detallesCreados: DetalleVentaRegistrado[] = [];
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

    await conexion.query("COMMIT");

    return {
      id_venta: ventaCreada.id_venta,
      fecha: ventaCreada.fecha,
      id_cliente: datos.id_cliente,
      cliente_nombre: cliente.nombre,
      cliente_cedula: cliente.cedula,
      cliente_correo: cliente.correo,
      id_vendedor: datos.id_vendedor,
      vendedor_nombre: vendedorNombre,
      codigo_caja: datos.codigo_caja,
      medio_pago: datos.medio_pago,
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

/**
 * Retorna las ventas recientes registradas por un vendedor.
 */
export async function listarVentasPorVendedor(
  id_vendedor: number,
  limite = 20
): Promise<ResumenVentaFila[]> {
  const consulta = `
    SELECT v.id_venta, v.fecha, v.codigo_caja, v.medio_pago, v.total,
           u.nombre AS cliente_nombre, u.cedula AS cliente_cedula,
           COALESCE(SUM(dv.cantidad), 0) AS cantidad_items
    FROM venta v
    JOIN usuario u ON u.id_usuario = v.id_cliente
    LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
    WHERE v.id_vendedor = $1
    GROUP BY v.id_venta, v.fecha, v.codigo_caja, v.medio_pago, v.total, u.nombre, u.cedula
    ORDER BY v.fecha DESC
    LIMIT $2
  `;
  const { rows } = await pool.query<ResumenVentaFila>(consulta, [id_vendedor, limite]);
  return rows.map((r) => ({
    ...r,
    total: typeof r.total === "string" ? parseFloat(r.total) : r.total,
    cantidad_items: Number(r.cantidad_items),
  }));
}
