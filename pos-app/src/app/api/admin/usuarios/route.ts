// GET /api/admin/usuarios
// GET /api/admin/usuarios?tipo_usuario=VENDEDOR
// GET /api/admin/usuarios?activo=true
//
// Cubre el criterio 4 (consultar usuarios) de la US_02, para cualquier rol,
// no solo vendedores -- por eso es una ruta separada de /api/admin/vendedores.

import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { listarUsuarios, type TipoUsuario } from "@/lib/administracion";

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

export async function GET(request: NextRequest) {
    const check = await requiereAdmin();
    if (check.error) return check.error;

    try {
        const parametros = request.nextUrl.searchParams;
        const tipoParametro = parametros.get("tipo_usuario");
        const activoParametro = parametros.get("activo");

        const tiposValidos: TipoUsuario[] = ["ADMIN", "VENDEDOR", "CLIENTE"];
        const tipo_usuario =
            tipoParametro && tiposValidos.includes(tipoParametro as TipoUsuario)
                ? (tipoParametro as TipoUsuario)
                : undefined;

        const usuarios = await listarUsuarios({
            tipo_usuario,
            soloActivos: activoParametro === "true",
        });

        return NextResponse.json({ usuarios });
    } catch (error) {
        console.error("Error en GET /api/admin/usuarios:", error);
        return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
    }
}