// PATCH /api/admin/inventario/umbral -> Modificar el umbral stock_minimo de un producto
import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { actualizarStockMinimo } from "@/lib/inventario";

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

export async function PATCH(request: NextRequest) {
  const check = await requiereAdmin();
  if (check.error) return check.error;

  try {
    const cuerpo = await request.json();
    const id_producto = Number(cuerpo.id_producto);
    const stock_minimo = Number(cuerpo.stock_minimo);

    if (!id_producto || !Number.isInteger(id_producto) || id_producto <= 0) {
      return NextResponse.json(
        { error: "Debe especificar un ID de producto válido." },
        { status: 400 }
      );
    }

    if (isNaN(stock_minimo) || !Number.isInteger(stock_minimo) || stock_minimo < 0) {
      return NextResponse.json(
        { error: "El umbral de stock mínimo debe ser un número entero mayor o igual a 0." },
        { status: 400 }
      );
    }

    const productoActualizado = await actualizarStockMinimo(id_producto, stock_minimo);

    return NextResponse.json({
      mensaje: `Umbral de stock mínimo actualizado a ${stock_minimo} para "${productoActualizado.nombre}".`,
      producto: productoActualizado,
    });
  } catch (error: unknown) {
    console.error("Error en PATCH /api/admin/inventario/umbral:", error);
    const mensaje = error instanceof Error ? error.message : "Error al actualizar el stock mínimo.";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
