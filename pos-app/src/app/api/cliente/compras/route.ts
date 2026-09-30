import { NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerComprasCliente } from "@/lib/cliente";

export async function GET() {
    try {
        // Verificamos quién está autenticado
        const sesion = await obtenerSesion();

        if (!sesion) {
            return NextResponse.json(
                { error: "No estás autenticado." },
                { status: 401 }
            );
        }

        // Solo los clientes pueden consultar este historial
        if (sesion.tipo_usuario !== "CLIENTE") {
            return NextResponse.json(
                { error: "No tienes permiso para consultar este historial." },
                { status: 403 }
            );
        }

        // El id_usuario viene de la sesión, NO de la petición
        const compras = await obtenerComprasCliente(sesion.id_usuario);

        return NextResponse.json({
            usuario: {
                id_usuario: sesion.id_usuario,
                nombre: sesion.nombre,
                correo: sesion.correo,
            },
            compras,
        });
    } catch (error) {
        console.error("Error en /api/cliente/compras:", error);

        return NextResponse.json(
            { error: "No se pudo obtener el historial de compras." },
            { status: 500 }
        );
    }
}