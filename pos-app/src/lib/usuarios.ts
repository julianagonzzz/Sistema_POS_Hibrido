// Consultas a las tablas usuario / cliente (según el MR del equipo).
// Todo lo que toca la base de datos vive aquí, para que las rutas de la API queden limpias.

import { pool } from "./db";

export type UsuarioBD = {
  id_usuario: number;
  nombre: string;
  correo: string;
  contrasena: string; // hash de bcrypt
  cedula: string;
  tipo_usuario: "ADMIN" | "VENDEDOR" | "CLIENTE";
};

export async function buscarPorCorreo(correo: string): Promise<UsuarioBD | null> {
  const { rows } = await pool.query<UsuarioBD>(
    `SELECT id_usuario, nombre, correo, contrasena, cedula, tipo_usuario
       FROM usuario
      WHERE correo = $1`,
    [correo]
  );
  return rows[0] ?? null;
}

// Devuelve qué campo ya está ocupado, para poder dar un mensaje específico.
export async function buscarDuplicado(
  correo: string,
  cedula: string
): Promise<"correo" | "cedula" | null> {
  const { rows } = await pool.query<{ correo: string; cedula: string }>(
    `SELECT correo, cedula FROM usuario WHERE correo = $1 OR cedula = $2`,
    [correo, cedula]
  );
  if (rows.some((fila) => fila.correo === correo)) return "correo";
  if (rows.some((fila) => fila.cedula === cedula)) return "cedula";
  return null;
}

// Un cliente vive en DOS tablas: usuario (los datos de acceso) y cliente
// (los datos propios del rol). Por eso va dentro de una transacción:
// o se insertan las dos filas, o no se inserta ninguna.
export async function crearCliente(datos: {
  nombre: string;
  correo: string;
  cedula: string;
  contrasenaHash: string;
}) {
  const conexion = await pool.connect();
  try {
    await conexion.query("BEGIN");

    const { rows } = await conexion.query<{
      id_usuario: number;
      nombre: string;
      correo: string;
      tipo_usuario: UsuarioBD["tipo_usuario"];
    }>(
      `INSERT INTO usuario (correo, contrasena, nombre, cedula, tipo_usuario)
       VALUES ($1, $2, $3, $4, 'CLIENTE')
       RETURNING id_usuario, nombre, correo, tipo_usuario`,
      [datos.correo, datos.contrasenaHash, datos.nombre, datos.cedula]
    );

    const usuario = rows[0];

    await conexion.query(`INSERT INTO cliente (id_usuario) VALUES ($1)`, [
      usuario.id_usuario,
    ]);

    await conexion.query("COMMIT");
    return usuario;
  } catch (error) {
    await conexion.query("ROLLBACK");
    throw error;
  } finally {
    conexion.release();
  }
}