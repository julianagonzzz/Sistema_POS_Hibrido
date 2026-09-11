import { NextResponse } from "next/server";
import { listarProductos } from "@/lib/productos";

export async function GET() {
  try {
    const productos = await listarProductos();
    return NextResponse.json({
      exito: true,
      productos,
      total: productos.length,
    });
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
    return NextResponse.json(
      { exito: false, mensaje: "Error al consultar los productos de la base de datos." },
      { status: 500 }
    );
  }
}
