// GET /api/checkout/perfil -> Precargar datos de entrega del cliente autenticado (CA1)
import { NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerPerfilEnvio } from "@/lib/checkout";

export async function GET() {
  const sesion = await obtenerSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const idUsuarioNum = parseInt(sesion.id_usuario, 10);
    const perfil = await obtenerPerfilEnvio(idUsuarioNum);

    return NextResponse.json({
      perfil: perfil ?? {
        id_usuario: idUsuarioNum,
        nombre: sesion.nombre,
        correo: sesion.correo,
        cedula: "",
        direccion: "",
        ciudad: "",
        telefono: "",
      },
    });
  } catch (error) {
    console.error("Error en GET /api/checkout/perfil:", error);
    return NextResponse.json(
      { error: "No fue posible obtener los datos de perfil." },
      { status: 500 }
    );
  }
}
