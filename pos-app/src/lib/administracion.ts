// Consultas a las tablas usuario / administrador / vendedor para la US_02
// (Panel de administrador). Mismo patrón que lib/usuarios.ts: todo el SQL
// vive aquí, para que las rutas de la API queden limpias.
//
// Nota de alcance (ver Observaciones de la US_02): el MR no tiene tablas de
// Rol ni Permiso, así que "asignar roles y permisos" se traduce, por ahora,
// en asignar el valor de tipo_usuario. No hay permisos independientes del rol.

import { pool } from "./db";

export type TipoUsuario = "ADMIN" | "VENDEDOR" | "CLIENTE";

export type UsuarioConEstado = {
    id_usuario: number;
    nombre: string;
    correo: string;
    cedula: string;
    tipo_usuario: TipoUsuario;
    activo: boolean;
};

export type VendedorBD = UsuarioConEstado & {
    codigo_caja: string | null;
    turno: string | null;
};

export type AdministradorBD = UsuarioConEstado & {
    dinero_en_cuenta: string; // numeric de Postgres llega como string
    cargo: string | null;
};

// ---------------------------------------------------------------------
// Criterio: "El administrador puede visualizar los vendedores y puntos
// de venta registrados." (el punto de venta es codigo_caja, ver supuesto
// en docs/US_02.md)
// ---------------------------------------------------------------------
export async function listarVendedores(): Promise<VendedorBD[]> {
    const { rows } = await pool.query<VendedorBD>(
        `SELECT u.id_usuario, u.nombre, u.correo, u.cedula, u.tipo_usuario, u.activo,
            v.codigo_caja, v.turno
       FROM usuario u
       JOIN vendedor v ON v.id_usuario = u.id_usuario
      ORDER BY u.nombre`
    );
    return rows;
}

// Listado general de usuarios, con filtro opcional por tipo y por estado.
// Sirve para la vista de "consultar usuarios" del panel.
export async function listarUsuarios(filtro?: {
    tipo_usuario?: TipoUsuario;
    soloActivos?: boolean;
}): Promise<UsuarioConEstado[]> {
    const condiciones: string[] = [];
    const valores: unknown[] = [];

    if (filtro?.tipo_usuario) {
        valores.push(filtro.tipo_usuario);
        condiciones.push(`tipo_usuario = $${valores.length}`);
    }
    if (filtro?.soloActivos) {
        condiciones.push(`activo = TRUE`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

    const { rows } = await pool.query<UsuarioConEstado>(
        `SELECT id_usuario, nombre, correo, cedula, tipo_usuario, activo
       FROM usuario
       ${where}
      ORDER BY nombre`,
        valores
    );
    return rows;
}

export async function obtenerUsuarioPorId(
    id_usuario: number
): Promise<UsuarioConEstado | null> {
    const { rows } = await pool.query<UsuarioConEstado>(
        `SELECT id_usuario, nombre, correo, cedula, tipo_usuario, activo
       FROM usuario
      WHERE id_usuario = $1`,
        [id_usuario]
    );
    return rows[0] ?? null;
}

// ---------------------------------------------------------------------
// Criterio: "El administrador puede crear usuarios y asociarlos a un
// vendedor o punto de venta." + "El sistema valida los campos obligatorios
// y evita correos duplicados."
//
// La validación de campos obligatorios y el chequeo de duplicados se hacen
// ANTES de llamar esta función (con lib/validaciones.ts y buscarDuplicado()
// de lib/usuarios.ts, igual que en el registro de clientes). Esta función
// asume que los datos ya vienen limpios y que contrasenaHash ya viene
// cifrado con bcrypt — igual que crearCliente().
// ---------------------------------------------------------------------
export async function crearVendedor(datos: {
    nombre: string;
    correo: string;
    cedula: string;
    contrasenaHash: string;
    codigo_caja?: string;
    turno?: string;
}): Promise<VendedorBD> {
    const conexion = await pool.connect();
    try {
        await conexion.query("BEGIN");

        const { rows: filasUsuario } = await conexion.query<UsuarioConEstado>(
            `INSERT INTO usuario (correo, contrasena, nombre, cedula, tipo_usuario)
       VALUES ($1, $2, $3, $4, 'VENDEDOR')
       RETURNING id_usuario, nombre, correo, cedula, tipo_usuario, activo`,
            [datos.correo, datos.contrasenaHash, datos.nombre, datos.cedula]
        );
        const usuario = filasUsuario[0];

        const { rows: filasVendedor } = await conexion.query<{
            codigo_caja: string | null;
            turno: string | null;
        }>(
            `INSERT INTO vendedor (id_usuario, codigo_caja, turno)
       VALUES ($1, $2, $3)
       RETURNING codigo_caja, turno`,
            [usuario.id_usuario, datos.codigo_caja ?? null, datos.turno ?? null]
        );

        await conexion.query("COMMIT");
        return { ...usuario, ...filasVendedor[0] };
    } catch (error) {
        await conexion.query("ROLLBACK");
        throw error;
    } finally {
        conexion.release();
    }
}

export async function crearAdministrador(datos: {
    nombre: string;
    correo: string;
    cedula: string;
    contrasenaHash: string;
    cargo?: string;
}): Promise<AdministradorBD> {
    const conexion = await pool.connect();
    try {
        await conexion.query("BEGIN");

        const { rows: filasUsuario } = await conexion.query<UsuarioConEstado>(
            `INSERT INTO usuario (correo, contrasena, nombre, cedula, tipo_usuario)
       VALUES ($1, $2, $3, $4, 'ADMIN')
       RETURNING id_usuario, nombre, correo, cedula, tipo_usuario, activo`,
            [datos.correo, datos.contrasenaHash, datos.nombre, datos.cedula]
        );
        const usuario = filasUsuario[0];

        const { rows: filasAdmin } = await conexion.query<{
            dinero_en_cuenta: string;
            cargo: string | null;
        }>(
            `INSERT INTO administrador (id_usuario, cargo)
       VALUES ($1, $2)
       RETURNING dinero_en_cuenta, cargo`,
            [usuario.id_usuario, datos.cargo ?? null]
        );

        await conexion.query("COMMIT");
        return { ...usuario, ...filasAdmin[0] };
    } catch (error) {
        await conexion.query("ROLLBACK");
        throw error;
    } finally {
        conexion.release();
    }
}

// ---------------------------------------------------------------------
// Criterio: "El administrador puede consultar, modificar y desactivar
// usuarios."
// ---------------------------------------------------------------------

// Actualiza solo los campos base (tabla usuario). Los campos propios del
// rol (codigo_caja, turno, cargo) se actualizan con actualizarVendedor().
export async function actualizarUsuario(
    id_usuario: number,
    datos: Partial<Pick<UsuarioConEstado, "nombre" | "correo" | "cedula">>
): Promise<UsuarioConEstado | null> {
    const campos = Object.keys(datos) as (keyof typeof datos)[];
    if (campos.length === 0) return obtenerUsuarioPorId(id_usuario);

    const asignaciones = campos.map((campo, i) => `${campo} = $${i + 1}`);
    const valores = campos.map((campo) => datos[campo]);

    const { rows } = await pool.query<UsuarioConEstado>(
        `UPDATE usuario
        SET ${asignaciones.join(", ")}
      WHERE id_usuario = $${campos.length + 1}
      RETURNING id_usuario, nombre, correo, cedula, tipo_usuario, activo`,
        [...valores, id_usuario]
    );
    return rows[0] ?? null;
}

export async function actualizarVendedor(
    id_usuario: number,
    datos: { codigo_caja?: string; turno?: string }
): Promise<void> {
    await pool.query(
        `UPDATE vendedor
        SET codigo_caja = COALESCE($2, codigo_caja),
            turno       = COALESCE($3, turno)
      WHERE id_usuario = $1`,
        [id_usuario, datos.codigo_caja ?? null, datos.turno ?? null]
    );
}

// "Desactivar" en vez de borrar (ALTER TABLE de sql/02_administracion.sql).
export async function desactivarUsuario(
    id_usuario: number
): Promise<UsuarioConEstado | null> {
    const { rows } = await pool.query<UsuarioConEstado>(
        `UPDATE usuario
        SET activo = FALSE
      WHERE id_usuario = $1
      RETURNING id_usuario, nombre, correo, cedula, tipo_usuario, activo`,
        [id_usuario]
    );
    return rows[0] ?? null;
}

export async function reactivarUsuario(
    id_usuario: number
): Promise<UsuarioConEstado | null> {
    const { rows } = await pool.query<UsuarioConEstado>(
        `UPDATE usuario
        SET activo = TRUE
      WHERE id_usuario = $1
      RETURNING id_usuario, nombre, correo, cedula, tipo_usuario, activo`,
        [id_usuario]
    );
    return rows[0] ?? null;
}