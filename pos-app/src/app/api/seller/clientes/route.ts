import { NextRequest, NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerInfoVendedor, buscarClientes, registrarClienteDesdePOS } from "@/lib/vendedores";
import { validarCorreo, validarNombre, validarCedula } from "@/lib/validaciones";

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
 * GET /api/seller/clientes?q=... (US_04)
 * Permite buscar clientes por correo, cédula o nombre.
 */
export async function GET(request: NextRequest) {
  const check = await verificarVendedor();
  if (check.error) return check.error;

  const { searchParams } = new URL(request.url);
  const termino = searchParams.get("q") ?? undefined;

  try {
    const clientes = await buscarClientes(termino);
    return NextResponse.json({ exito: true, clientes });
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    return NextResponse.json(
      { error: "Error al consultar los clientes." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/clientes (US_03)
 * Registra un nuevo cliente desde el POS asociando la caja del vendedor activo.
 */
export async function POST(request: NextRequest) {
  const check = await verificarVendedor();
  if (check.error) return check.error;

  try {
    const cuerpo = await request.json();
    const nombre = String(cuerpo.nombre ?? "").trim();
    const correo = String(cuerpo.correo ?? "").trim().toLowerCase();
    const cedula = String(cuerpo.cedula ?? "").trim();
    const telefono = cuerpo.telefono ? String(cuerpo.telefono).trim() : undefined;
    const direccion = cuerpo.direccion ? String(cuerpo.direccion).trim() : undefined;

    // Validar campos obligatorios (Criterio 1 y 5 de US_03)
    const errNombre = validarNombre(nombre);
    if (errNombre) return NextResponse.json({ error: errNombre }, { status: 400 });

    const errCorreo = validarCorreo(correo);
    if (errCorreo) return NextResponse.json({ error: errCorreo }, { status: 400 });

    const errCedula = validarCedula(cedula);
    if (errCedula) return NextResponse.json({ error: errCedula }, { status: 400 });

    const resultado = await registrarClienteDesdePOS({
      nombre,
      correo,
      cedula,
      telefono,
      direccion,
      codigo_caja: check.vendedor.codigo_caja,
      id_vendedor: check.vendedor.id_usuario,
    });

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Cliente registrado exitosamente en el punto de venta.",
        cliente: resultado.cliente,
        contrasenaAsignada: resultado.contrasenaAsignada,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error al registrar cliente desde POS:", error);
    const mensaje = error instanceof Error ? error.message : "Error al registrar el cliente.";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
