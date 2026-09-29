import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import {
    crearProducto,
    listarProductos,
    type DatosProducto,
} from "@/lib/productos";

async function requiereAdmin() {
    const sesion = await obtenerSesion();

    if (!sesion) {
        return {
            error: NextResponse.json(
                { error: "No autenticado." },
                { status: 401 }
            ),
        };
    }

    if (sesion.tipo_usuario !== "ADMIN") {
        return {
            error: NextResponse.json(
                { error: "No autorizado." },
                { status: 403 }
            ),
        };
    }

    return { sesion };
}

// GET /api/admin/productos
export async function GET() {
    const check = await requiereAdmin();

    if (check.error) {
        return check.error;
    }

    try {
        const productos = await listarProductos();

        return NextResponse.json({ productos });
    } catch (error) {
        console.error("Error en GET /api/admin/productos:", error);

        return NextResponse.json(
            { error: "No se pudieron obtener los productos." },
            { status: 500 }
        );
    }
}

// POST /api/admin/productos
export async function POST(request: NextRequest) {
    const check = await requiereAdmin();

    if (check.error) {
        return check.error;
    }

    try {
        const datos = (await request.json()) as DatosProducto;

        const producto = await crearProducto(datos);

        return NextResponse.json(
            { producto },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error en POST /api/admin/productos:", error);

        const mensaje =
            error instanceof Error
                ? error.message
                : "No se pudo crear el producto.";

        // Código 23505 = violación de UNIQUE en PostgreSQL
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            return NextResponse.json(
                { error: "Ya existe un producto con ese código de barras." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: mensaje },
            { status: 400 }
        );
    }
}