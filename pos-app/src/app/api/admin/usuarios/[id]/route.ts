// PATCH /api/admin/usuarios/:id
//
// Cubre el resto del criterio 4 (modificar y desactivar/reactivar usuarios).
// Un solo PATCH para las tres acciones: se decide qué hacer según qué
// campos vengan en el body, para no crear cuatro rutas distintas.
//
// Body admitido (todos los campos son opcionales, manda solo lo que cambia):
// {
//   "nombre": "...",
//   "correo": "...",
//   "cedula": "...",
//   "activo": true | false,          // desactivar / reactivar
//   "codigo_caja": "...",            // solo aplica si el usuario es VENDEDOR
//   "turno": "..."                   // solo aplica si el usuario es VENDEDOR
// }

import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import {
    obtenerUsuarioPorId,
    actualizarUsuario,
    actualizarVendedor,
    desactivarUsuario,
    reactivarUsuario,
} from "@/lib/administracion";

async function requiereAdmin() {
    const sesion = await obtenerSesion();
    if (!sesion) {
        return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
    }
    if (sesion.tipo_usuario !== "ADMIN") {
        return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
    }
    return { sesion };
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requiereAdmin();
    if (check.error) return check.error;

    const { id } = await params;
    const id_usuario = Number(id);
    if (!Number.isInteger(id_usuario)) {
        return NextResponse.json({ error: "Id de usuario inválido." }, { status: 400 });
    }

    const existente = await obtenerUsuarioPorId(id_usuario);
    if (!existente) {
        return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    try {
        const cuerpo = await request.json();

        // 1. Activar / desactivar (criterio "desactivar usuarios")
        if (typeof cuerpo.activo === "boolean") {
            if (cuerpo.activo) {
                await reactivarUsuario(id_usuario);
            } else {
                await desactivarUsuario(id_usuario);
            }
        }

        // 2. Campos base (nombre, correo, cedula)
        const camposBase: Record<string, string> = {};
        if (typeof cuerpo.nombre === "string") camposBase.nombre = cuerpo.nombre.trim();
        if (typeof cuerpo.correo === "string") camposBase.correo = cuerpo.correo.trim().toLowerCase();
        if (typeof cuerpo.cedula === "string") camposBase.cedula = cuerpo.cedula.trim();

        if (Object.keys(camposBase).length > 0) {
            await actualizarUsuario(id_usuario, camposBase);
        }

        // 3. Campos propios de vendedor, solo si aplica a este usuario
        if (
            existente.tipo_usuario === "VENDEDOR" &&
            (typeof cuerpo.codigo_caja === "string" || typeof cuerpo.turno === "string")
        ) {
            await actualizarVendedor(id_usuario, {
                codigo_caja: cuerpo.codigo_caja,
                turno: cuerpo.turno,
            });
        }

        const actualizado = await obtenerUsuarioPorId(id_usuario);
        return NextResponse.json({ usuario: actualizado });
    } catch (error) {
        console.error(`Error en PATCH /api/admin/usuarios/${id}:`, error);
        return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
    }
}