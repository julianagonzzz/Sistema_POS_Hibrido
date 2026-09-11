// GET  /api/admin/vendedores  -> listar vendedores y su punto de venta
// POST /api/admin/vendedores  -> crear un vendedor
//
// Cubre los criterios 1, 2 y 3 de la US_02 para el rol vendedor.
// Cualquiera de los dos métodos requiere que quien llama sea ADMIN
// (criterio 6) -- ver requiereAdmin() al inicio del archivo.

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { obtenerSesion } from "@/lib/sesion";
import { buscarDuplicado } from "@/lib/usuarios";
import {
    validarNombre,
    validarCorreo,
    validarCedula,
    validarContrasena,
} from "@/lib/validaciones";
import { listarVendedores, crearVendedor } from "@/lib/administracion";

// Repetido en cada ruta de /api/admin, igual que el resto del proyecto
// mantiene cada route.ts autocontenido (ver api/auth/login, por ejemplo).
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

export async function GET() {
    const check = await requiereAdmin();
    if (check.error) return check.error;

    try {
        const vendedores = await listarVendedores();
        return NextResponse.json({ vendedores });
    } catch (error) {
        console.error("Error en GET /api/admin/vendedores:", error);
        return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const check = await requiereAdmin();
    if (check.error) return check.error;

    try {
        const cuerpo = await request.json();
        const nombre = String(cuerpo.nombre ?? "").trim();
        const correo = String(cuerpo.correo ?? "").trim().toLowerCase();
        const cedula = String(cuerpo.cedula ?? "").trim();
        const contrasena = String(cuerpo.contrasena ?? "");
        const codigo_caja = cuerpo.codigo_caja ? String(cuerpo.codigo_caja).trim() : undefined;
        const turno = cuerpo.turno ? String(cuerpo.turno).trim() : undefined;

        // Mismas reglas que usa /api/auth/registro, para no duplicar criterios
        // de validación distintos entre las dos formas de crear usuarios.
        const errorValidacion =
            validarNombre(nombre) ??
            validarCorreo(correo) ??
            validarCedula(cedula) ??
            validarContrasena(contrasena);
        if (errorValidacion) {
            return NextResponse.json({ error: errorValidacion }, { status: 400 });
        }

        const duplicado = await buscarDuplicado(correo, cedula);
        if (duplicado) {
            return NextResponse.json(
                { error: `Ya existe un usuario con ese ${duplicado}.` },
                { status: 409 }
            );
        }

        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const vendedor = await crearVendedor({
            nombre,
            correo,
            cedula,
            contrasenaHash,
            codigo_caja,
            turno,
        });

        return NextResponse.json({ vendedor }, { status: 201 });
    } catch (error) {
        console.error("Error en POST /api/admin/vendedores:", error);
        return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
    }
}