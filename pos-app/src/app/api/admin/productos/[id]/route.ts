import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import {
    actualizarProducto,
    buscarProductoPorId,
    desactivarProducto,
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

function obtenerId(id: string): number | null {
    const numero = Number(id);

    if (!Number.isInteger(numero) || numero <= 0) {
        return null;
    }

    return numero;
}

// GET /api/admin/productos/:id
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requiereAdmin();

    if (check.error) {
        return check.error;
    }

    try {
        const { id } = await params;
        const id_producto = obtenerId(id);

        if (id_producto === null) {
            return NextResponse.json(
                { error: "ID de producto inválido." },
                { status: 400 }
            );
        }

        const producto = await buscarProductoPorId(id_producto);

        if (!producto) {
            return NextResponse.json(
                { error: "Producto no encontrado." },
                { status: 404 }
            );
        }

        return NextResponse.json({ producto });
    } catch (error) {
        console.error("Error en GET /api/admin/productos/[id]:", error);

        return NextResponse.json(
            { error: "No se pudo obtener el producto." },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/productos/:id
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requiereAdmin();

    if (check.error) {
        return check.error;
    }

    try {
        const { id } = await params;
        const id_producto = obtenerId(id);

        if (id_producto === null) {
            return NextResponse.json(
                { error: "ID de producto inválido." },
                { status: 400 }
            );
        }

        const datos = (await request.json()) as DatosProducto;

        const producto = await actualizarProducto(id_producto, datos);

        if (!producto) {
            return NextResponse.json(
                { error: "Producto no encontrado o inactivo." },
                { status: 404 }
            );
        }

        return NextResponse.json({ producto });
    } catch (error) {
        console.error("Error en PATCH /api/admin/productos/[id]:", error);

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

        const mensaje =
            error instanceof Error
                ? error.message
                : "No se pudo actualizar el producto.";

        return NextResponse.json(
            { error: mensaje },
            { status: 400 }
        );
    }
}

// DELETE /api/admin/productos/:id
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requiereAdmin();

    if (check.error) {
        return check.error;
    }

    try {
        const { id } = await params;
        const id_producto = obtenerId(id);

        if (id_producto === null) {
            return NextResponse.json(
                { error: "ID de producto inválido." },
                { status: 400 }
            );
        }

        const producto = await desactivarProducto(id_producto);

        if (!producto) {
            return NextResponse.json(
                { error: "Producto no encontrado o ya estaba inactivo." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            mensaje: "Producto desactivado correctamente.",
            producto,
        });
    } catch (error) {
        console.error("Error en DELETE /api/admin/productos/[id]:", error);

        return NextResponse.json(
            { error: "No se pudo desactivar el producto." },
            { status: 500 }
        );
    }
}