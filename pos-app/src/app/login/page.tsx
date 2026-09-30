"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// A dónde mandamos a cada rol después de entrar.
// Estas páginas son de las otras historias (US_02, US_04, US_05).
// Mientras no existan, puedes dejar "/" en las tres.
const RUTA_POR_ROL: Record<string, string> = {
  ADMIN: "/admin",
  VENDEDOR: "/seller",
  CLIENTE: "/catalogo",
};

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo iniciar sesión.");
        return;
      }

      router.push(RUTA_POR_ROL[datos.usuario.tipo_usuario] ?? "/");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-slate-50 min-h-screen">
      <div className="w-full max-w-sm border border-slate-200 rounded-2xl p-8 bg-white shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/images/nexovolk-logo.png"
            alt="NexoVolk"
            className="w-10 h-10 rounded-xl object-contain shadow-xs"
          />
          <span className="text-xl font-black tracking-tight text-slate-900">
            Nexo<span className="text-orange-500">Volk</span>
          </span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Iniciar sesión</h1>
        <p className="text-sm text-zinc-500 mt-1">Ingresa con tu correo y contraseña.</p>

        <form onSubmit={manejarEnvio} className="mt-6 space-y-4">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-zinc-700">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-zinc-700">
              Contraseña
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="contrasena"
                // type="password" => el navegador la oculta mientras se digita
                type={verContrasena ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                autoComplete="current-password"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setVerContrasena(!verContrasena)}
                className="rounded-lg border border-zinc-300 px-3 text-xs text-zinc-600 hover:bg-zinc-50 cursor-pointer"
              >
                {verContrasena ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-xs cursor-pointer transition-colors"
          >
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-zinc-900 underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}