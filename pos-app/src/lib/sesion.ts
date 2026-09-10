// Manejo de la sesión: se guarda un token firmado (JWT) en una cookie httpOnly.
// httpOnly = el navegador la envía sola en cada petición, pero el JavaScript
// de la página NO la puede leer (protege contra robo de sesión).

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const NOMBRE_COOKIE = "sesion";
const DURACION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días

function obtenerClave() {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) {
    throw new Error("Falta la variable de entorno AUTH_SECRET en .env.local");
  }
  return new TextEncoder().encode(secreto);
}

export type DatosSesion = {
  id_usuario: string;
  correo: string;
  nombre: string;
  tipo_usuario: "ADMIN" | "VENDEDOR" | "CLIENTE";
};

export async function crearSesion(datos: DatosSesion): Promise<void> {
  const token = await new SignJWT({ ...datos })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(obtenerClave());

  const cookieStore = await cookies();
  cookieStore.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function obtenerSesion(): Promise<DatosSesion | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOMBRE_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, obtenerClave());
    return {
      id_usuario: String(payload.id_usuario),
      correo: String(payload.correo),
      nombre: String(payload.nombre),
      tipo_usuario: payload.tipo_usuario as DatosSesion["tipo_usuario"],
    };
  } catch {
    // Token vencido o alterado
    return null;
  }
}

export async function cerrarSesion(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NOMBRE_COOKIE);
}