import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerInfoVendedor } from "@/lib/vendedores";
import { registrarVenta, listarVentasPorVendedor, MedioPago } from "@/lib/ventas";

const MEDIOS_PAGO_VALIDOS: MedioPago[] = ["EFECTIVO", "DATAFONO", "NEQUI", "TRANSFERENCIA"];

async function verificarVendedor() {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  }
  if (sesion.tipo_usuario !== "VENDEDOR") {
    return { error: NextResponse.json({ error: "Acceso denegado. Se requiere rol VENDEDOR." }, { status: 403 }) };
  }
  const vendedor = await obtenerInfoVendedor(Number(sesion.id_usuario));
  if (!vendedor) {
    return { error: NextResponse.json({ error: "Vendedor no encontrado en el sistema." }, { status: 404 }) };
  }
  return { sesion, vendedor };
}

/**
 * GET /api/seller/ventas
 * Lista el historial de ventas recientes del vendedor actual.
 */
export async function GET() {
  const check = await verificarVendedor();
  if (check.error) return check.error;

  try {
    const ventas = await listarVentasPorVendedor(check.vendedor.id_usuario);
    return NextResponse.json({ exito: true, ventas });
  } catch (error) {
    console.error("Error al obtener ventas del vendedor:", error);
    return NextResponse.json(
      { error: "Error al consultar las ventas." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/ventas (US_04)
 * Registra una compra con productos, calcula el total, descuenta stock y guarda la transacción.
 */
export async function POST(request: NextRequest) {
  const check = await verificarVendedor();
  if (check.error) return check.error;

  try {
    const cuerpo = await request.json();
    const id_cliente = Number(cuerpo.id_cliente);
    const medio_pago = String(cuerpo.medio_pago ?? "").toUpperCase() as MedioPago;
    const items = cuerpo.items;

    if (!id_cliente || isNaN(id_cliente)) {
      return NextResponse.json(
        { error: "Debe seleccionar un cliente registrado para la venta." },
        { status: 400 }
      );
    }

    if (!MEDIOS_PAGO_VALIDOS.includes(medio_pago)) {
      return NextResponse.json(
        { error: "Medio de pago no válido. Seleccione EFECTIVO, DATAFONO, NEQUI o TRANSFERENCIA." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un producto en la venta." },
        { status: 400 }
      );
    }

    const venta = await registrarVenta({
      id_cliente,
      id_vendedor: check.vendedor.id_usuario,
      codigo_caja: check.vendedor.codigo_caja,
      medio_pago,
      items: items.map((it: { id_producto: number; cantidad: number }) => ({
        id_producto: Number(it.id_producto),
        cantidad: Number(it.cantidad),
      })),
    });

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Venta registrada exitosamente.",
        venta,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error al registrar venta en POS:", error);
    const mensaje = error instanceof Error ? error.message : "Error al procesar la venta.";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
