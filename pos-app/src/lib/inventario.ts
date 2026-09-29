// =====================================================================
// lib/inventario.ts: Gestión de inventario, reposición y alertas (US_13)
// =====================================================================

import { pool } from "./db";

export type EstadoStock = "AGOTADO" | "CRITICO" | "NORMAL";

export interface ProductoInventario {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidad_stock: number;
  stock_minimo: number;
  categoria: string;
  genero: string | null;
  talla: string | null;
  codigo_barras: string | null;
  imagen_url: string | null;
  activo: boolean;
  estado_stock: EstadoStock;
}

export interface ResumenInventario {
  total_productos: number;
  total_agotados: number;
  total_criticos: number;
  total_normales: number;
  total_unidades: number;
}

interface ProductoFilaBD {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio: string | number;
  cantidad_stock: number;
  stock_minimo: number;
  categoria: string;
  genero: string | null;
  talla: string | null;
  codigo_barras: string | null;
  imagen_url: string | null;
  activo: boolean;
}

/**
 * Determina el estado de alerta del inventario según las reglas de negocio de la US_13:
 * - AGOTADO: cantidad_stock = 0
 * - CRITICO: cantidad_stock <= stock_minimo (y > 0)
 * - NORMAL:  cantidad_stock > stock_minimo
 */
export function determinarEstadoStock(
  cantidad_stock: number,
  stock_minimo: number
): EstadoStock {
  if (cantidad_stock <= 0) {
    return "AGOTADO";
  }
  if (cantidad_stock <= stock_minimo) {
    return "CRITICO";
  }
  return "NORMAL";
}

function mapearFila(fila: ProductoFilaBD): ProductoInventario {
  const stock = Number(fila.cantidad_stock) || 0;
  const minimo = Number(fila.stock_minimo) || 0;
  return {
    ...fila,
    precio: typeof fila.precio === "string" ? parseFloat(fila.precio) : fila.precio,
    cantidad_stock: stock,
    stock_minimo: minimo,
    estado_stock: determinarEstadoStock(stock, minimo),
  };
}

/**
 * Consulta los productos para el panel de administración con cálculo de estado y métricas.
 */
export async function listarInventario(filtros?: {
  urgenteSolo?: boolean;
  categoria?: string;
  busqueda?: string;
}): Promise<{
  productos: ProductoInventario[];
  resumen: ResumenInventario;
  categorias: string[];
}> {
  // 1. Obtener todos los productos activos para cálculo de resumen general y categorías
  const consultaTodos = `
    SELECT id_producto, nombre, descripcion, precio, cantidad_stock,
           stock_minimo, categoria, genero, talla, codigo_barras,
           imagen_url, activo
    FROM producto
    WHERE activo = TRUE
    ORDER BY id_producto ASC
  `;
  const resTodos = await pool.query<ProductoFilaBD>(consultaTodos);
  const todosProductos = resTodos.rows.map(mapearFila);

  // 2. Calcular resumen global
  const resumen: ResumenInventario = {
    total_productos: todosProductos.length,
    total_agotados: 0,
    total_criticos: 0,
    total_normales: 0,
    total_unidades: 0,
  };

  const categoriasSet = new Set<string>();

  for (const prod of todosProductos) {
    categoriasSet.add(prod.categoria);
    resumen.total_unidades += prod.cantidad_stock;

    if (prod.estado_stock === "AGOTADO") {
      resumen.total_agotados += 1;
    } else if (prod.estado_stock === "CRITICO") {
      resumen.total_criticos += 1;
    } else {
      resumen.total_normales += 1;
    }
  }

  // 3. Filtrar según los parámetros requeridos
  let productos = todosProductos;

  // Criterio 4: Filtro rápido para consultar exclusivamente los productos que requieren reposición urgente
  // (Agotados o con stock <= stock_minimo)
  if (filtros?.urgenteSolo) {
    productos = productos.filter(
      (p) => p.estado_stock === "AGOTADO" || p.estado_stock === "CRITICO"
    );
  }

  if (filtros?.categoria && filtros.categoria !== "Todos") {
    productos = productos.filter((p) => p.categoria === filtros.categoria);
  }

  if (filtros?.busqueda && filtros.busqueda.trim() !== "") {
    const q = filtros.busqueda.toLowerCase().trim();
    productos = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  }

  return {
    productos,
    resumen,
    categorias: Array.from(categoriasSet).sort(),
  };
}

/**
 * Criterios 1 y 5: Repone unidades sumándolas al stock actual.
 * Valida de forma estricta que la cantidad no sea negativa ni cero.
 */
export async function reponerStock(
  id_producto: number,
  cantidad: number
): Promise<ProductoInventario> {
  // Validación de no negatividad / valores inválidos (Criterio 5)
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new Error("La cantidad de reposición debe ser un número entero mayor a 0.");
  }

  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new Error("El identificador del producto es inválido.");
  }

  const conexion = await pool.connect();
  try {
    await conexion.query("BEGIN");

    // Bloqueo pesimista de fila para evitar condiciones de carrera concurrentes
    const check = await conexion.query<ProductoFilaBD>(
      `SELECT id_producto, nombre, descripcion, precio, cantidad_stock,
              stock_minimo, categoria, genero, talla, codigo_barras,
              imagen_url, activo
       FROM producto
       WHERE id_producto = $1
       FOR UPDATE`,
      [id_producto]
    );

    if (check.rows.length === 0) {
      throw new Error(`El producto con ID ${id_producto} no fue encontrado.`);
    }

    const productoActual = check.rows[0];
    if (!productoActual.activo) {
      throw new Error(`El producto "${productoActual.nombre}" se encuentra inactivo.`);
    }

    const resUpdate = await conexion.query<ProductoFilaBD>(
      `UPDATE producto
       SET cantidad_stock = cantidad_stock + $1::integer
       WHERE id_producto = $2
       RETURNING id_producto, nombre, descripcion, precio, cantidad_stock,
                 stock_minimo, categoria, genero, talla, codigo_barras,
                 imagen_url, activo`,
      [cantidad, id_producto]
    );

    await conexion.query("COMMIT");
    return mapearFila(resUpdate.rows[0]);
  } catch (error) {
    await conexion.query("ROLLBACK");
    throw error;
  } finally {
    conexion.release();
  }
}

/**
 * Criterio 2: Configurar el umbral de stock_minimo por producto.
 */
export async function actualizarStockMinimo(
  id_producto: number,
  nuevoStockMinimo: number
): Promise<ProductoInventario> {
  if (!Number.isInteger(nuevoStockMinimo) || nuevoStockMinimo < 0) {
    throw new Error("El umbral de stock mínimo debe ser un número entero mayor o igual a 0.");
  }

  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new Error("El identificador del producto es inválido.");
  }

  const { rows } = await pool.query<ProductoFilaBD>(
    `UPDATE producto
     SET stock_minimo = $1::integer
     WHERE id_producto = $2 AND activo = TRUE
     RETURNING id_producto, nombre, descripcion, precio, cantidad_stock,
               stock_minimo, categoria, genero, talla, codigo_barras,
               imagen_url, activo`,
    [nuevoStockMinimo, id_producto]
  );

  if (rows.length === 0) {
    throw new Error(`El producto con ID ${id_producto} no existe o no está activo.`);
  }

  return mapearFila(rows[0]);
}
