// US_09 - Gestión del carrito de compras (E-commerce)
// Lógica del carrito que corre en el servidor: tipos y validación contra la base de datos.
// Los impuestos ya vienen incluidos en el precio de cada producto.

import { pool } from "./db";

/** Ítem tal como se guarda en el navegador (localStorage). */
export interface ItemCarrito {
  id_producto: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  categoria: string;
  cantidad: number;
  stock_disponible: number; // último stock conocido: es el tope de cantidad
}

/** Tipos de cambio que se pueden detectar al comparar con la base de datos. */
export type TipoAlteracion = "ELIMINADO" | "AGOTADO" | "STOCK_AJUSTADO" | "PRECIO_CAMBIADO";

export interface AlteracionCarrito {
  id_producto: number;
  nombre: string;
  tipo: TipoAlteracion;
  detalle: string;
}

export interface ResultadoValidacion {
  items: ItemCarrito[]; // carrito ya corregido
  alteraciones: AlteracionCarrito[];
}

/**
 * Compara el carrito con el estado actual de la tabla producto y devuelve
 * el carrito corregido junto con la lista de cambios encontrados:
 * - Producto eliminado o desactivado  -> se quita del carrito.
 * - Producto agotado (stock = 0)       -> se quita del carrito.
 * - Stock menor a la cantidad pedida   -> se ajusta al máximo disponible.
 * - Precio distinto al guardado        -> se actualiza al precio vigente.
 */
export async function validarCarrito(
  items: { id_producto: number; cantidad: number; nombre?: string; precio?: number }[]
): Promise<ResultadoValidacion> {
  // IDs únicos y válidos (evita consultas con basura)
  const ids = [...new Set(items.map((i) => Number(i.id_producto)).filter((n) => Number.isInteger(n) && n > 0))];
  if (ids.length === 0) return { items: [], alteraciones: [] };

  // Una sola consulta para todos los productos (ANY) en vez de una por producto
  const { rows } = await pool.query<{
    id_producto: number;
    nombre: string;
    precio: string | number;
    cantidad_stock: number;
    imagen_url: string | null;
    categoria: string;
    activo: boolean;
  }>(
    `SELECT id_producto, nombre, precio, cantidad_stock, imagen_url, categoria, activo
     FROM producto
     WHERE id_producto = ANY($1::int[])`,
    [ids]
  );
  const porId = new Map(rows.map((r) => [r.id_producto, r]));

  const corregidos: ItemCarrito[] = [];
  const alteraciones: AlteracionCarrito[] = [];

  for (const item of items) {
    const prod = porId.get(Number(item.id_producto));
    const nombre = prod?.nombre ?? item.nombre ?? `Producto #${item.id_producto}`;

    if (!prod || !prod.activo) {
      alteraciones.push({
        id_producto: item.id_producto,
        nombre,
        tipo: "ELIMINADO",
        detalle: "Ya no está disponible en el catálogo y se retiró del carrito.",
      });
      continue;
    }

    if (prod.cantidad_stock <= 0) {
      alteraciones.push({
        id_producto: item.id_producto,
        nombre,
        tipo: "AGOTADO",
        detalle: "Se agotó y se retiró del carrito.",
      });
      continue;
    }

    // pg devuelve DECIMAL como texto: se convierte a número
    const precioActual = typeof prod.precio === "string" ? parseFloat(prod.precio) : prod.precio;
    let cantidad = Math.max(1, Math.floor(Number(item.cantidad) || 1));

    if (cantidad > prod.cantidad_stock) {
      alteraciones.push({
        id_producto: item.id_producto,
        nombre,
        tipo: "STOCK_AJUSTADO",
        detalle: `Solo quedan ${prod.cantidad_stock} unidades; se ajustó la cantidad de ${cantidad} a ${prod.cantidad_stock}.`,
      });
      cantidad = prod.cantidad_stock;
    }

    if (item.precio !== undefined && Number(item.precio) !== precioActual) {
      alteraciones.push({
        id_producto: item.id_producto,
        nombre,
        tipo: "PRECIO_CAMBIADO",
        detalle: "El precio cambió y se actualizó al valor vigente.",
      });
    }

    corregidos.push({
      id_producto: prod.id_producto,
      nombre: prod.nombre,
      precio: precioActual,
      imagen_url: prod.imagen_url,
      categoria: prod.categoria,
      cantidad,
      stock_disponible: prod.cantidad_stock,
    });
  }

  return { items: corregidos, alteraciones };
}