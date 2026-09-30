"use client";

// Registro del e-commerce. Solo crea usuarios tipo CLIENTE.
// El registro en el punto físico lo hace el cajero (US_03), no es esta pantalla.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  validarNombre,
  validarCorreo,
  validarCedula,
  validarContrasena,
} from "@/lib/validaciones";

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [cedula, setCedula] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Se muestra en vivo mientras escribe, pero solo cuando ya escribió algo.
  const errorContrasena = contrasena ? validarContrasena(contrasena) : null;

  async function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    // Validación en el navegador: respuesta inmediata, sin ir al servidor.
    // La API vuelve a validar lo mismo, porque esto se puede saltar.
    const errorLocal =
      validarNombre(nombre) ||
      validarCorreo(correo) ||
      validarCedula(cedula) ||
      validarContrasena(contrasena);
    if (errorLocal) {
      setError(errorLocal);
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, cedula, contrasena }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo crear la cuenta.");
        return;
      }

      // El registro ya deja la sesión abierta, así que va directo al catálogo.
      router.push("/catalogo");
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
        <h1 className="text-xl font-bold text-zinc-900">Crear cuenta</h1>
        <p className="text-sm text-zinc-500 mt-1">Para comprar en la tienda en línea.</p>

        <form onSubmit={manejarEnvio} className="mt-6 space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-zinc-700">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

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
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="cedula" className="block text-sm font-medium text-zinc-700">
              Cédula
            </label>
            <input
              id="cedula"
              type="text"
              inputMode="numeric"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-zinc-700">
              Contraseña
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="contrasena"
                type={verContrasena ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                autoComplete="new-password"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
              />
              <button
                type="button"
                onClick={() => setVerContrasena(!verContrasena)}
                className="rounded-lg border border-zinc-300 px-3 text-xs text-zinc-600 hover:bg-zinc-50"
              >
                {verContrasena ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p className={`mt-1.5 text-xs ${errorContrasena ? "text-red-600" : "text-zinc-500"}`}>
              {errorContrasena ??
                "Mínimo 8 caracteres, una mayúscula, un número y un carácter especial (# * $ _ - %)."}
            </p>
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
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}