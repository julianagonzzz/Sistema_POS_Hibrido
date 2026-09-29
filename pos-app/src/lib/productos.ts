import { pool } from "./db";

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidad_stock: number;
  stock_minimo?: number;
  categoria: string;
  genero: string | null;
  talla: string | null;
  codigo_barras: string | null;
  imagen_url: string | null;
  activo: boolean;
}

interface ProductoFila {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio: string | number;
  cantidad_stock: number;
  stock_minimo?: number;
  categoria: string;
  genero: string | null;
  talla: string | null;
  codigo_barras: string | null;
  imagen_url: string | null;
  activo: boolean;
}

function mapearProducto(fila: ProductoFila): Producto {
  return {
    ...fila,
    precio: typeof fila.precio === "string" ? parseFloat(fila.precio) : fila.precio,
  };
}

/**
 * Retorna todos los productos activos disponibles en la base de datos.
 */
export async function listarProductos(categoria?: string): Promise<Producto[]> {
  let consulta = `
    SELECT id_producto, nombre, descripcion, precio, cantidad_stock,
           categoria, genero, talla, codigo_barras, imagen_url, activo
    FROM producto
    WHERE activo = TRUE
  `;
  const params: unknown[] = [];

  if (categoria && categoria !== "Todos") {
    params.push(categoria);
    consulta += ` AND categoria = $${params.length}`;
  }

  consulta += " ORDER BY id_producto ASC";

  const resultado = await pool.query<ProductoFila>(consulta, params);
  return resultado.rows.map(mapearProducto);
}

/**
 * Retorna una muestra variada de productos destacados (uno por categoría principal) para el Home.
 */
export async function listarProductosDestacados(limite = 4): Promise<Producto[]> {
  // Obtenemos el primer producto de cada categoría para mostrar variedad
  const consulta = `
    SELECT DISTINCT ON (categoria)
           id_producto, nombre, descripcion, precio, cantidad_stock,
           categoria, genero, talla, codigo_barras, imagen_url, activo
    FROM producto
    WHERE activo = TRUE
    ORDER BY categoria, id_producto ASC
    LIMIT $1
  `;
  const resultado = await pool.query<ProductoFila>(consulta, [limite]);
  return resultado.rows.map(mapearProducto);
}

/**
 * Retorna la lista de categorías únicas disponibles en la base de datos.
 */
export async function listarCategorias(): Promise<string[]> {
  const consulta = `
    SELECT DISTINCT categoria
    FROM producto
    WHERE activo = TRUE
    ORDER BY categoria ASC
  `;
  const resultado = await pool.query<{ categoria: string }>(consulta);
  return resultado.rows.map((r) => r.categoria);
}

/**
 * Busca un producto por su ID.
 */
export async function buscarProductoPorId(id: number): Promise<Producto | null> {
  const consulta = `
    SELECT id_producto, nombre, descripcion, precio, cantidad_stock,
           categoria, genero, talla, codigo_barras, imagen_url, activo
    FROM producto
    WHERE id_producto = $1
    LIMIT 1
  `;
  const resultado = await pool.query<ProductoFila>(consulta, [id]);
  if (resultado.rows.length === 0) return null;
  return mapearProducto(resultado.rows[0]);
}
