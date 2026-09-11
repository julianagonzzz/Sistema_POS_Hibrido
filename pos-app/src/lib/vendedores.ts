import bcrypt from "bcryptjs";
import { pool } from "./db";
import { buscarDuplicado } from "./usuarios";

export interface VendedorInfo {
  id_usuario: number;
  nombre: string;
  correo: string;
  cedula: string;
  codigo_caja: string;
  turno: string;
  activo: boolean;
}

export interface ClienteRegistrado {
  id_usuario: number;
  nombre: string;
  correo: string;
  cedula: string;
  telefono: string | null;
  direccion: string | null;
  punto_venta: string | null;
  fecha_creacion?: string;
}

/**
 * Obtiene la información detallada del vendedor autenticado (incluyendo caja y turno).
 */
export async function obtenerInfoVendedor(id_usuario: number): Promise<VendedorInfo | null> {
  const consulta = `
    SELECT u.id_usuario, u.nombre, u.correo, u.cedula, u.activo,
           COALESCE(v.codigo_caja, 'CAJA-01') AS codigo_caja,
           COALESCE(v.turno, 'MAÑANA') AS turno
    FROM usuario u
    JOIN vendedor v ON v.id_usuario = u.id_usuario
    WHERE u.id_usuario = $1
    LIMIT 1
  `;
  const { rows } = await pool.query<VendedorInfo>(consulta, [id_usuario]);
  return rows[0] ?? null;
}

/**
 * Busca clientes registrados por correo, cédula o nombre (US_04).
 */
export async function buscarClientes(termino?: string): Promise<ClienteRegistrado[]> {
  let consulta = `
    SELECT u.id_usuario, u.nombre, u.correo, u.cedula,
           c.telefono, c.direccion, c.punto_venta
    FROM usuario u
    JOIN cliente c ON c.id_usuario = u.id_usuario
    WHERE u.tipo_usuario = 'CLIENTE'
  `;
  const params: unknown[] = [];

  if (termino && termino.trim()) {
    params.push(`%${termino.trim().toLowerCase()}%`);
    consulta += ` AND (
      LOWER(u.correo) LIKE $1 OR
      LOWER(u.cedula) LIKE $1 OR
      LOWER(u.nombre) LIKE $1
    )`;
  }

  consulta += ` ORDER BY u.nombre ASC LIMIT 30`;

  const { rows } = await pool.query<ClienteRegistrado>(consulta, params);
  return rows;
}

/**
 * Registra un nuevo cliente desde el punto de venta (US_03).
 * Asocia automáticamente la información al punto de venta y al vendedor en turno.
 */
export async function registrarClienteDesdePOS(datos: {
  nombre: string;
  correo: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  codigo_caja: string;
  id_vendedor: number;
  contrasenaTemporal?: string;
}): Promise<{
  cliente: ClienteRegistrado;
  contrasenaAsignada: string;
}> {
  // 1. Validar duplicados de correo o cédula
  const duplicado = await buscarDuplicado(datos.correo, datos.cedula);
  if (duplicado === "correo") {
    throw new Error("El correo electrónico ya se encuentra registrado.");
  }
  if (duplicado === "cedula") {
    throw new Error("El número de cédula ya se encuentra registrado.");
  }

  // 2. Definir contraseña temporal para acceso a e-commerce (Criterio 3 de US_03)
  const contrasenaAsignada = datos.contrasenaTemporal || `${datos.cedula}*`;
  const contrasenaHash = await bcrypt.hash(contrasenaAsignada, 10);

  const conexion = await pool.connect();
  try {
    await conexion.query("BEGIN");

    // Insertar en tabla usuario
    const resUsuario = await conexion.query<{
      id_usuario: number;
      nombre: string;
      correo: string;
      cedula: string;
    }>(
      `INSERT INTO usuario (correo, contrasena, nombre, cedula, tipo_usuario, activo)
       VALUES ($1, $2, $3, $4, 'CLIENTE', TRUE)
       RETURNING id_usuario, nombre, correo, cedula`,
      [datos.correo, contrasenaHash, datos.nombre, datos.cedula]
    );

    const usuarioCreado = resUsuario.rows[0];

    // Insertar en tabla cliente con punto_venta
    await conexion.query(
      `INSERT INTO cliente (id_usuario, telefono, direccion, punto_venta, id_vendedor_registro)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        usuarioCreado.id_usuario,
        datos.telefono || null,
        datos.direccion || null,
        datos.codigo_caja,
        datos.id_vendedor,
      ]
    );

    await conexion.query("COMMIT");

    return {
      cliente: {
        id_usuario: usuarioCreado.id_usuario,
        nombre: usuarioCreado.nombre,
        correo: usuarioCreado.correo,
        cedula: usuarioCreado.cedula,
        telefono: datos.telefono || null,
        direccion: datos.direccion || null,
        punto_venta: datos.codigo_caja,
      },
      contrasenaAsignada,
    };
  } catch (error) {
    await conexion.query("ROLLBACK");
    throw error;
  } finally {
    conexion.release();
  }
}
