import { NextRequest, NextResponse } from "next/server";
import { validarCarrito } from "@/lib/carrito";

/**
 * POST /api/carrito/validar (US_09)
 * Recibe los ítems del carrito del navegador y los compara con el inventario
 * real (tabla producto). Devuelve el carrito corregido y las alteraciones.
 * Body: { items: [{ id_producto, cantidad, nombre?, precio? }] }
 * Es público: el visitante sin sesión también puede tener carrito.
 */
export async function POST(request: NextRequest) {
  try {
    const cuerpo = await request.json().catch(() => null);
    const items = cuerpo?.items;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Formato inválido: se esperaba { items: [...] }." }, { status: 400 });
    }
    if (items.length > 100) {
      return NextResponse.json({ error: "El carrito no puede tener más de 100 productos distintos." }, { status: 400 });
    }

    const resultado = await validarCarrito(
      items.map((it: { id_producto: unknown; cantidad: unknown; nombre?: unknown; precio?: unknown }) => ({
        id_producto: Number(it.id_producto),
        cantidad: Number(it.cantidad),
        nombre: typeof it.nombre === "string" ? it.nombre : undefined,
        precio: it.precio === undefined ? undefined : Number(it.precio),
      }))
    );

    return NextResponse.json({ exito: true, ...resultado });
  } catch (error) {
    console.error("Error al validar el carrito:", error);
    return NextResponse.json({ error: "No se pudo validar el carrito con el inventario." }, { status: 500 });
  }
}