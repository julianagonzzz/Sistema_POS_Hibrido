"use client";

// PÁGINA TEMPORAL de la US_01. No es parte del sistema final.
// Sirve para ver el estado de la sesión mientras las pantallas reales
// (/catalogo, /pos, /admin) todavía no existen.
// Cuando esas estén listas, este archivo se borra.

import { useEffect, useState } from "react";
import Link from "next/link";

type Sesion = {
  id_usuario: string;
  correo: string;
  nombre: string;
  tipo_usuario: string;
} | null;

export default function PruebaPage() {
  const [sesion, setSesion] = useState<Sesion>(null);
  const [cargando, setCargando] = useState(true);

  async function consultarSesion() {
    setCargando(true);
    const respuesta = await fetch("/api/auth/sesion");
    const datos = await respuesta.json();
    setSesion(datos.usuario);
    setCargando(false);
  }

  useEffect(() => {
    consultarSesion();
  }, []);

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    await consultarSesion();
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-zinc-200 rounded-2xl p-8 bg-white">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          US_01 · Página de prueba
        </p>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900">Estado de la sesión</h1>

        <div className="mt-6 rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm">
          {cargando && <p className="text-zinc-500">Consultando...</p>}

          {!cargando && !sesion && (
            <p className="text-zinc-600">
              No hay ninguna sesión abierta.
            </p>
          )}

          {!cargando && sesion && (
            <dl className="space-y-1 text-zinc-800">
              <div className="flex gap-2">
                <dt className="w-28 text-zinc-500">Nombre</dt>
                <dd className="font-medium">{sesion.nombre}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-zinc-500">Correo</dt>
                <dd className="font-medium">{sesion.correo}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-zinc-500">Rol</dt>
                <dd className="font-medium">{sesion.tipo_usuario}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-zinc-500">id_usuario</dt>
                <dd className="font-mono text-xs">{sesion.id_usuario}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/registro"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Ir a registro
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Ir a login
          </Link>
          <button
            onClick={consultarSesion}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Refrescar
          </button>
          {sesion && (
            <button
              onClick={cerrarSesion}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Cerrar sesión
            </button>
          )}
        </div>

        <p className="mt-6 text-xs text-zinc-400">
          Esta página consulta <code className="font-mono">GET /api/auth/sesion</code>. Si aquí
          aparecen tus datos, la cookie de sesión está funcionando.
        </p>
      </div>
    </main>
  );
}