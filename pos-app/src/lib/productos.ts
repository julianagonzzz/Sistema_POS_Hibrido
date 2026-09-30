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

export interface DatosProducto {
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
}

/**
 * Crea un nuevo producto.
 */
export async function crearProducto(datos: DatosProducto): Promise<Producto> {
  if (!datos.nombre?.trim()) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  if (!datos.categoria?.trim()) {
    throw new Error("La categoría es obligatoria.");
  }

  if (!Number.isFinite(datos.precio) || datos.precio < 0) {
    throw new Error("El precio debe ser un número mayor o igual a 0.");
  }

  if (!Number.isInteger(datos.cantidad_stock) || datos.cantidad_stock < 0) {
    throw new Error("La cantidad de stock debe ser un entero mayor o igual a 0.");
  }

  if (!Number.isInteger(datos.stock_minimo) || datos.stock_minimo < 0) {
    throw new Error("El stock mínimo debe ser un entero mayor o igual a 0.");
  }

  const consulta = `
    INSERT INTO producto (
      nombre,
      descripcion,
      precio,
      cantidad_stock,
      stock_minimo,
      categoria,
      genero,
      talla,
      codigo_barras,
      imagen_url,
      activo
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
    RETURNING
      id_producto,
      nombre,
      descripcion,
      precio,
      cantidad_stock,
      stock_minimo,
      categoria,
      genero,
      talla,
      codigo_barras,
      imagen_url,
      activo
  `;

  const resultado = await pool.query<ProductoFila>(consulta, [
    datos.nombre.trim(),
    datos.descripcion?.trim() || null,
    datos.precio,
    datos.cantidad_stock,
    datos.stock_minimo,
    datos.categoria.trim(),
    datos.genero?.trim() || null,
    datos.talla?.trim() || null,
    datos.codigo_barras?.trim() || null,
    datos.imagen_url?.trim() || null,
  ]);

  return mapearProducto(resultado.rows[0]);
}

/**
 * Actualiza los datos de un producto activo.
 */
export async function actualizarProducto(
  id_producto: number,
  datos: DatosProducto
): Promise<Producto | null> {
  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new Error("El identificador del producto es inválido.");
  }

  if (!datos.nombre?.trim()) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  if (!datos.categoria?.trim()) {
    throw new Error("La categoría es obligatoria.");
  }

  if (!Number.isFinite(datos.precio) || datos.precio < 0) {
    throw new Error("El precio debe ser un número mayor o igual a 0.");
  }

  if (!Number.isInteger(datos.cantidad_stock) || datos.cantidad_stock < 0) {
    throw new Error("La cantidad de stock debe ser un entero mayor o igual a 0.");
  }

  if (!Number.isInteger(datos.stock_minimo) || datos.stock_minimo < 0) {
    throw new Error("El stock mínimo debe ser un entero mayor o igual a 0.");
  }

  const consulta = `
    UPDATE producto
    SET
      nombre = $1,
      descripcion = $2,
      precio = $3,
      cantidad_stock = $4,
      stock_minimo = $5,
      categoria = $6,
      genero = $7,
      talla = $8,
      codigo_barras = $9,
      imagen_url = $10
    WHERE id_producto = $11
      AND activo = TRUE
    RETURNING
      id_producto,
      nombre,
      descripcion,
      precio,
      cantidad_stock,
      stock_minimo,
      categoria,
      genero,
      talla,
      codigo_barras,
      imagen_url,
      activo
  `;

  const resultado = await pool.query<ProductoFila>(consulta, [
    datos.nombre.trim(),
    datos.descripcion?.trim() || null,
    datos.precio,
    datos.cantidad_stock,
    datos.stock_minimo,
    datos.categoria.trim(),
    datos.genero?.trim() || null,
    datos.talla?.trim() || null,
    datos.codigo_barras?.trim() || null,
    datos.imagen_url?.trim() || null,
    id_producto,
  ]);

  if (resultado.rows.length === 0) {
    return null;
  }

  return mapearProducto(resultado.rows[0]);
}

/**
 * Desactiva un producto.
 *
 * No hacemos DELETE físico porque los productos pueden estar
 * relacionados con ventas históricas.
 */
export async function desactivarProducto(
  id_producto: number
): Promise<Producto | null> {
  if (!Number.isInteger(id_producto) || id_producto <= 0) {
    throw new Error("El identificador del producto es inválido.");
  }

  const consulta = `
    UPDATE producto
    SET activo = FALSE
    WHERE id_producto = $1
      AND activo = TRUE
    RETURNING
      id_producto,
      nombre,
      descripcion,
      precio,
      cantidad_stock,
      stock_minimo,
      categoria,
      genero,
      talla,
      codigo_barras,
      imagen_url,
      activo
  `;

  const resultado = await pool.query<ProductoFila>(consulta, [id_producto]);

  if (resultado.rows.length === 0) {
    return null;
  }

  return mapearProducto(resultado.rows[0]);
}