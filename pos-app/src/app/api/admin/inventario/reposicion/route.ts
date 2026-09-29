// POST /api/admin/inventario/reposicion -> Sumar unidades al stock actual de un producto
import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { reponerStock } from "@/lib/inventario";

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

export async function POST(request: NextRequest) {
  const check = await requiereAdmin();
  if (check.error) return check.error;

  try {
    const cuerpo = await request.json();
    const id_producto = Number(cuerpo.id_producto);
    const cantidad = Number(cuerpo.cantidad);

    // Validación Criterio 5: no permitir cantidades negativas ni cero
    if (!id_producto || !Number.isInteger(id_producto) || id_producto <= 0) {
      return NextResponse.json(
        { error: "Debe especificar un ID de producto válido." },
        { status: 400 }
      );
    }

    if (isNaN(cantidad) || !Number.isInteger(cantidad) || cantidad <= 0) {
      return NextResponse.json(
        { error: "La cantidad a reponer debe ser un número entero mayor a 0." },
        { status: 400 }
      );
    }

    const productoActualizado = await reponerStock(id_producto, cantidad);

    return NextResponse.json({
      mensaje: `Se sumaron exitosamente ${cantidad} unidades al producto "${productoActualizado.nombre}".`,
      producto: productoActualizado,
    });
  } catch (error: unknown) {
    console.error("Error en POST /api/admin/inventario/reposicion:", error);
    const mensaje = error instanceof Error ? error.message : "Error al procesar la reposición.";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
