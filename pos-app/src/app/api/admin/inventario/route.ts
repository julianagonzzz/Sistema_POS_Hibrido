// GET /api/admin/inventario -> Listar productos de inventario, alertas y resumen
import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { listarInventario } from "@/lib/inventario";

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
    const { searchParams } = new URL(request.url);
    const urgenteSolo = searchParams.get("urgente") === "true";
    const categoria = searchParams.get("categoria") ?? undefined;
    const busqueda = searchParams.get("busqueda") ?? undefined;

    const datos = await listarInventario({
      urgenteSolo,
      categoria,
      busqueda,
    });

    return NextResponse.json(datos);
  } catch (error) {
    console.error("Error en GET /api/admin/inventario:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el inventario." },
      { status: 500 }
    );
  }
}
