"use client";

import { useEffect, useState, useCallback } from "react";
import GestionInventario from "./inventario/GestionInventario";
import GestionProductos from "./productos/GestionProductos";

// Mismo tipo que expone lib/administracion.ts en el servidor;
// se repite aquí porque este archivo corre en el navegador.
type Vendedor = {
    id_usuario: number;
    nombre: string;
    correo: string;
    cedula: string;
    tipo_usuario: string;
    activo: boolean;
    codigo_caja: string | null;
    turno: string | null;
};

type FormularioVendedor = {
    nombre: string;
    correo: string;
    cedula: string;
    contrasena: string;
    codigo_caja: string;
    turno: string;
};

const FORMULARIO_VACIO: FormularioVendedor = {
    nombre: "",
    correo: "",
    cedula: "",
    contrasena: "",
    codigo_caja: "",
    turno: "",
};

export default function PanelAdmin({ nombreAdmin }: { nombreAdmin: string }) {
    const [seccionActiva, setSeccionActiva] =
        useState<"vendedores" | "inventario" | "productos">(
            "vendedores"
        );
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formulario, setFormulario] = useState<FormularioVendedor>(FORMULARIO_VACIO);
    const [enviando, setEnviando] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

    // Criterio 1: visualizar vendedores y puntos de venta registrados.
    const cargarVendedores = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await fetch("/api/admin/vendedores");
            const datos = await respuesta.json();
            if (!respuesta.ok) {
                setError(datos.error ?? "No se pudo cargar la lista.");
                return;
            }
            setVendedores(datos.vendedores);
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarVendedores();
    }, [cargarVendedores]);

    // Criterio 2 y 3: crear usuario asociado a un vendedor/punto de venta,
    // con validación de campos obligatorios y correos duplicados.
    // La validación en sí ocurre en el servidor (POST /api/admin/vendedores);
    // aquí solo se muestra el error que ese endpoint devuelva.
    async function manejarCreacion(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setErrorFormulario(null);
        setEnviando(true);

        try {
            const respuesta = await fetch("/api/admin/vendedores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formulario),
            });
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                setErrorFormulario(datos.error ?? "No se pudo crear el vendedor.");
                return;
            }

            setFormulario(FORMULARIO_VACIO);
            await cargarVendedores();
        } catch {
            setErrorFormulario("No se pudo conectar con el servidor.");
        } finally {
            setEnviando(false);
        }
    }

    // Criterio 4: desactivar / reactivar usuarios.
    async function alternarActivo(vendedor: Vendedor) {
        try {
            const respuesta = await fetch(`/api/admin/usuarios/${vendedor.id_usuario}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activo: !vendedor.activo }),
            });
            if (!respuesta.ok) {
                const datos = await respuesta.json();
                setError(datos.error ?? "No se pudo actualizar el estado.");
                return;
            }
            await cargarVendedores();
        } catch {
            setError("No se pudo conectar con el servidor.");
        }
    }

    function actualizarCampo(campo: keyof FormularioVendedor, valor: string) {
        setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    }

    return (
        <main className="flex-1 bg-zinc-50 px-6 py-10">
            <div className="mx-auto max-w-5xl space-y-8">
                <header>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                            KATRONIX POS
                        </span>
                        <span className="text-xs text-zinc-400">Control Central de Operaciones</span>
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900">Panel de Administración</h1>
                    <p className="mt-1 text-sm text-zinc-500">Sesión activa: {nombreAdmin}</p>
                </header>

                {/* Selector de módulos del Administrador */}
                <nav className="flex space-x-2 border-b border-zinc-200 pb-3">
                    <button
                        type="button"
                        onClick={() => setSeccionActiva("vendedores")}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${seccionActiva === "vendedores"
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                            }`}
                    >
                        👥 Vendedores y Cajas
                    </button>
                    <button
                        type="button"
                        onClick={() => setSeccionActiva("inventario")}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${seccionActiva === "inventario"
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                            }`}
                    >
                        <span>📦 Inventario y Reposición</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSeccionActiva("productos")}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${seccionActiva === "productos"
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                            }`}
                    >
                        <span>🛍️ Productos</span>
                    </button>
                </nav>

                {seccionActiva === "inventario" ? (
                    <GestionInventario />
                ) : seccionActiva === "productos" ? (
                    <GestionProductos />
                ) : (
                    <>
                        {/* Formulario: crear vendedor */}
                        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                            <h2 className="text-lg font-medium text-zinc-900">Crear vendedor</h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                El código de caja representa el punto de venta asignado a este vendedor.
                            </p>

                            <form onSubmit={manejarCreacion} className="mt-4 grid gap-4 sm:grid-cols-2">
                                <Campo
                                    etiqueta="Nombre"
                                    id="nombre"
                                    value={formulario.nombre}
                                    onChange={(v) => actualizarCampo("nombre", v)}
                                    required
                                />
                                <Campo
                                    etiqueta="Correo"
                                    id="correo"
                                    type="email"
                                    value={formulario.correo}
                                    onChange={(v) => actualizarCampo("correo", v)}
                                    required
                                />
                                <Campo
                                    etiqueta="Cédula"
                                    id="cedula"
                                    value={formulario.cedula}
                                    onChange={(v) => actualizarCampo("cedula", v)}
                                    required
                                />
                                <Campo
                                    etiqueta="Contraseña temporal"
                                    id="contrasena"
                                    type="password"
                                    value={formulario.contrasena}
                                    onChange={(v) => actualizarCampo("contrasena", v)}
                                    required
                                />
                                <Campo
                                    etiqueta="Código de caja (punto de venta)"
                                    id="codigo_caja"
                                    value={formulario.codigo_caja}
                                    onChange={(v) => actualizarCampo("codigo_caja", v)}
                                />
                                <Campo
                                    etiqueta="Turno"
                                    id="turno"
                                    value={formulario.turno}
                                    onChange={(v) => actualizarCampo("turno", v)}
                                />

                                {errorFormulario && (
                                    <p className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                        {errorFormulario}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="sm:col-span-2 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {enviando ? "Creando..." : "Crear vendedor"}
                                </button>
                            </form>
                        </section>

                        {/* Tabla: vendedores registrados */}
                        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                            <h2 className="text-lg font-medium text-zinc-900">Vendedores registrados</h2>

                            {error && (
                                <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </p>
                            )}

                            {cargando ? (
                                <p className="mt-4 text-sm text-zinc-500">Cargando...</p>
                            ) : vendedores.length === 0 ? (
                                <p className="mt-4 text-sm text-zinc-500">No hay vendedores registrados todavía.</p>
                            ) : (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-zinc-200 text-left text-zinc-500">
                                                <th className="py-2 pr-4">Nombre</th>
                                                <th className="py-2 pr-4">Correo</th>
                                                <th className="py-2 pr-4">Punto de venta</th>
                                                <th className="py-2 pr-4">Turno</th>
                                                <th className="py-2 pr-4">Estado</th>
                                                <th className="py-2 pr-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendedores.map((vendedor) => (
                                                <tr key={vendedor.id_usuario} className="border-b border-zinc-100">
                                                    <td className="py-2 pr-4 text-zinc-900">{vendedor.nombre}</td>
                                                    <td className="py-2 pr-4 text-zinc-600">{vendedor.correo}</td>
                                                    <td className="py-2 pr-4 text-zinc-600">{vendedor.codigo_caja ?? "—"}</td>
                                                    <td className="py-2 pr-4 text-zinc-600">{vendedor.turno ?? "—"}</td>
                                                    <td className="py-2 pr-4">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${vendedor.activo
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-zinc-100 text-zinc-500"
                                                                }`}
                                                        >
                                                            {vendedor.activo ? "Activo" : "Desactivado"}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 pr-4 text-right">
                                                        <button
                                                            onClick={() => alternarActivo(vendedor)}
                                                            className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                                                        >
                                                            {vendedor.activo ? "Desactivar" : "Reactivar"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

// Input reutilizable, mismo estilo visual que /login.
function Campo({
    etiqueta,
    id,
    value,
    onChange,
    type = "text",
    required = false,
}: {
    etiqueta: string;
    id: string;
    value: string;
    onChange: (valor: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
                {etiqueta}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
        </div>
    );
}
