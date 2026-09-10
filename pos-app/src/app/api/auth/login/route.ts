// POST /api/auth/login
// Sirve para los tres roles: administrador, cajero y cliente.

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { buscarPorCorreo } from "@/lib/usuarios";
import { crearSesion } from "@/lib/sesion";

export async function POST(request: NextRequest) {
  try {
    const cuerpo = await request.json();
    const correo = String(cuerpo.correo ?? "").trim().toLowerCase();
    const contrasena = String(cuerpo.contrasena ?? "");

    if (!correo || !contrasena) {
      return NextResponse.json(
        { error: "Debes ingresar correo y contraseña." },
        { status: 400 }
      );
    }

    const usuario = await buscarPorCorreo(correo);

    // Mensaje genérico a propósito: si dijéramos "ese correo no existe"
    // le estaríamos confirmando a un atacante qué correos están registrados.
    const credencialesInvalidas = NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );

    if (!usuario) return credencialesInvalidas;

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) return credencialesInvalidas;

    await crearSesion({
      id_usuario: String(usuario.id_usuario),
      correo: usuario.correo,
      nombre: usuario.nombre,
      tipo_usuario: usuario.tipo_usuario,
    });

    return NextResponse.json({
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo_usuario: usuario.tipo_usuario,
      },
    });
  } catch (error) {
    console.error("Error en /api/auth/login:", error);
    return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
  }
}