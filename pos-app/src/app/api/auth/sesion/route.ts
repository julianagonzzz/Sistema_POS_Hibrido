// GET /api/auth/sesion — devuelve quién está logueado (o null).
// Le sirve al resto del equipo para las US_02, US_04 y US_05.

import { NextResponse } from "next/server";
import { obtenerSesion } from "@/lib/sesion";

export async function GET() {
  const sesion = await obtenerSesion();
  return NextResponse.json({ usuario: sesion });
}