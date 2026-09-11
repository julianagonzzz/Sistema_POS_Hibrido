// POST /api/auth/registro
// Registro de CLIENTE desde el e-commerce. Admin y vendedor NO se registran aquí:
// esos usuarios los crea el administrador (US_02) o el cajero (US_03).

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { buscarDuplicado, crearCliente } from "@/lib/usuarios";
import { crearSesion } from "@/lib/sesion";
import {
  validarCorreo,
  validarNombre,
  validarCedula,
  validarContrasena,
} from "@/lib/validaciones";

export async function POST(request: NextRequest) {
  try {
    const cuerpo = await request.json();
    const nombre = String(cuerpo.nombre ?? "").trim();
    const correo = String(cuerpo.correo ?? "").trim().toLowerCase();
    const cedula = String(cuerpo.cedula ?? "").trim();
    const contrasena = String(cuerpo.contrasena ?? "");

    // 1. Validaciones (las mismas que corren en el formulario, pero aquí no se pueden saltar)
    const error =
      validarNombre(nombre) ||
      validarCorreo(correo) ||
      validarCedula(cedula) ||
      validarContrasena(contrasena);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // 2. No permitir usuarios duplicados (correo y cédula son UNIQUE en el MR)
    const duplicado = await buscarDuplicado(correo, cedula);
    if (duplicado === "correo") {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con ese correo." },
        { status: 409 }
      );
    }
    if (duplicado === "cedula") {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con esa cédula." },
        { status: 409 }
      );
    }

    // 3. Guardar la contraseña cifrada, nunca en texto plano
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const usuario = await crearCliente({ nombre, correo, cedula, contrasenaHash });

    // 4. Dejarlo logueado de una vez
    await crearSesion({
      id_usuario: String(usuario.id_usuario),
      correo: usuario.correo,
      nombre: usuario.nombre,
      tipo_usuario: usuario.tipo_usuario,
    });

    return NextResponse.json({ usuario }, { status: 201 });
  } catch (error: unknown) {
    // 23505 = violación de UNIQUE en Postgres. Cubre el caso raro de que dos
    // personas manden el mismo correo al tiempo y pasen el paso 2.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json(
        { error: "Ese correo o esa cédula ya están registrados." },
        { status: 409 }
      );
    }
    console.error("Error en /api/auth/registro:", error);
    return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
  }
}