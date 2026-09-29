// POST /api/checkout -> Formalizar compra del carrito online de forma atómica (CA3, CA4, CA5)
import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { procesarCheckoutOnline, SolicitudCheckoutOnline } from "@/lib/checkout";

export async function POST(request: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para completar tu pedido." },
      { status: 401 }
    );
  }

  try {
    const cuerpo = await request.json();
    const id_cliente = parseInt(sesion.id_usuario, 10);

    const solicitud: SolicitudCheckoutOnline = {
      id_cliente,
      direccion: String(cuerpo.direccion ?? "").trim(),
      ciudad: String(cuerpo.ciudad ?? "").trim(),
      telefono: String(cuerpo.telefono ?? "").trim(),
      medio_pago: cuerpo.medio_pago,
      detalles_pago: cuerpo.detalles_pago,
      items: Array.isArray(cuerpo.items)
        ? cuerpo.items.map((it: { id_producto: number; cantidad: number }) => ({
            id_producto: Number(it.id_producto),
            cantidad: Number(it.cantidad),
          }))
        : [],
      guardar_datos_envio: Boolean(cuerpo.guardar_datos_envio),
    };

    const venta = await procesarCheckoutOnline(solicitud);

    return NextResponse.json({
      ok: true,
      mensaje: "Pedido online confirmado y registrado exitosamente.",
      venta,
    });
  } catch (error: unknown) {
    console.error("Error en POST /api/checkout:", error);
    const mensaje = error instanceof Error ? error.message : "Error al procesar el pedido online.";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
