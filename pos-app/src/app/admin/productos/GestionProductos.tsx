"use client";

import { useEffect, useState } from "react";
import { ProductImage } from "@/components/ProductImage";

type Producto = {
    id_producto: number;
    nombre: string;
    descripcion: string | null;
    precio: number;
    cantidad_stock: number;
    stock_minimo: number;
    categoria: string;
    genero: string | null;
    talla: string | null;
    codigo_barras: string | null;
    imagen_url: string | null;
    activo: boolean;
};

type FormularioProducto = {
    nombre: string;
    descripcion: string;
    precio: string;
    cantidad_stock: string;
    stock_minimo: string;
    categoria: string;
    genero: string;
    talla: string;
    codigo_barras: string;
    imagen_url: string;
};

const FORMULARIO_VACIO: FormularioProducto = {
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad_stock: "0",
    stock_minimo: "5",
    categoria: "",
    genero: "Unisex",
    talla: "Única",
    codigo_barras: "",
    imagen_url: "",
};

export default function GestionProductos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [productoEditando, setProductoEditando] =
        useState<Producto | null>(null);

    const [formulario, setFormulario] =
        useState<FormularioProducto>(FORMULARIO_VACIO);

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function cargarProductos() {
        setCargando(true);
        setError(null);

        try {
            const respuesta = await fetch("/api/admin/productos");
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                setError(datos.error ?? "No se pudieron cargar los productos.");
                return;
            }

            setProductos(datos.productos);
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarProductos();
    }, []);

    function abrirCrear() {
        setProductoEditando(null);
        setFormulario(FORMULARIO_VACIO);
        setError(null);
        setModalAbierto(true);
    }

    function abrirEditar(producto: Producto) {
        setProductoEditando(producto);

        setFormulario({
            nombre: producto.nombre,
            descripcion: producto.descripcion ?? "",
            precio: String(producto.precio),
            cantidad_stock: String(producto.cantidad_stock),
            stock_minimo: String(producto.stock_minimo),
            categoria: producto.categoria,
            genero: producto.genero ?? "",
            talla: producto.talla ?? "",
            codigo_barras: producto.codigo_barras ?? "",
            imagen_url: producto.imagen_url ?? "",
        });

        setError(null);
        setModalAbierto(true);
    }

    function actualizarCampo(
        campo: keyof FormularioProducto,
        valor: string
    ) {
        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    async function guardarProducto(
        evento: React.FormEvent<HTMLFormElement>
    ) {
        evento.preventDefault();

        setGuardando(true);
        setError(null);

        const datos = {
            nombre: formulario.nombre,
            descripcion: formulario.descripcion || null,
            precio: Number(formulario.precio),
            cantidad_stock: Number(formulario.cantidad_stock),
            stock_minimo: Number(formulario.stock_minimo),
            categoria: formulario.categoria,
            genero: formulario.genero || null,
            talla: formulario.talla || null,
            codigo_barras: formulario.codigo_barras || null,
            imagen_url: formulario.imagen_url || null,
        };

        try {
            const esEdicion = productoEditando !== null;

            const respuesta = await fetch(
                esEdicion
                    ? `/api/admin/productos/${productoEditando.id_producto}`
                    : "/api/admin/productos",
                {
                    method: esEdicion ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(datos),
                }
            );

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                setError(
                    resultado.error ??
                    "No se pudo guardar el producto."
                );
                return;
            }

            setModalAbierto(false);
            setProductoEditando(null);
            setFormulario(FORMULARIO_VACIO);

            await cargarProductos();
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setGuardando(false);
        }
    }

    async function eliminarProducto(producto: Producto) {
        const confirmar = window.confirm(
            `¿Deseas quitar el producto "${producto.nombre}"?`
        );

        if (!confirmar) {
            return;
        }

        try {
            const respuesta = await fetch(
                `/api/admin/productos/${producto.id_producto}`,
                {
                    method: "DELETE",
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                setError(
                    datos.error ?? "No se pudo quitar el producto."
                );
                return;
            }

            await cargarProductos();
        } catch {
            setError("No se pudo conectar con el servidor.");
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900">
                        Gestión de productos
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Crear, consultar, editar y quitar productos.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={abrirCrear}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm cursor-pointer transition-colors"
                >
                    + Agregar producto
                </button>
            </div>

            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </p>
            )}

            {cargando ? (
                <p className="text-sm text-zinc-500">
                    Cargando productos...
                </p>
            ) : productos.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    No hay productos activos.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left text-zinc-500">
                                <th className="px-4 py-3">Producto</th>
                                <th className="px-4 py-3">Categoría</th>
                                <th className="px-4 py-3">Precio</th>
                                <th className="px-4 py-3">Stock</th>
                                <th className="px-4 py-3">Código</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {productos.map((producto) => (
                                <tr
                                    key={producto.id_producto}
                                    className="border-b border-zinc-100"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                                <ProductImage
                                                    src={producto.imagen_url}
                                                    alt={producto.nombre}
                                                    className="w-full h-full object-contain p-1"
                                                    fallbackEmoji="⚡"
                                                />
                                            </div>

                                            <div>
                                                <p className="font-medium text-zinc-900">
                                                    {producto.nombre}
                                                </p>

                                                <p className="text-xs text-zinc-500">
                                                    ID: {producto.id_producto}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-zinc-600">
                                        {producto.categoria}
                                    </td>

                                    <td className="px-4 py-3 text-zinc-900">
                                        $
                                        {Number(producto.precio).toLocaleString(
                                            "es-CO"
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-zinc-600">
                                        {producto.cantidad_stock}
                                    </td>

                                    <td className="px-4 py-3 text-zinc-600">
                                        {producto.codigo_barras ?? "—"}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    abrirEditar(producto)
                                                }
                                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    eliminarProducto(producto)
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-zinc-900">
                                {productoEditando
                                    ? "Editar producto"
                                    : "Agregar producto"}
                            </h3>

                            <button
                                type="button"
                                onClick={() => setModalAbierto(false)}
                                className="text-zinc-500 hover:text-zinc-900"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={guardarProducto}
                            className="mt-6 grid gap-4 sm:grid-cols-2"
                        >
                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-700">
                                    Nombre *
                                </label>

                                <input
                                    value={formulario.nombre}
                                    onChange={(e) =>
                                        actualizarCampo("nombre", e.target.value)
                                    }
                                    required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-700">
                                    Descripción
                                </label>

                                <textarea
                                    value={formulario.descripcion}
                                    onChange={(e) =>
                                        actualizarCampo(
                                            "descripcion",
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-700">
                                    Precio *
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formulario.precio}
                                    onChange={(e) =>
                                        actualizarCampo("precio", e.target.value)
                                    }
                                    required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-700">
                                    Cantidad de stock *
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formulario.cantidad_stock}
                                    onChange={(e) =>
                                        actualizarCampo(
                                            "cantidad_stock",
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-700">
                                    Stock mínimo
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formulario.stock_minimo}
                                    onChange={(e) =>
                                        actualizarCampo(
                                            "stock_minimo",
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-700">
                                    Categoría *
                                </label>

                                <input
                                    value={formulario.categoria}
                                    onChange={(e) =>
                                        actualizarCampo(
                                            "categoria",
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-700">
                                    Marca / Fabricante
                                </label>

                                <input
                                    value={formulario.genero}
                                    placeholder="Apple, Samsung, HP, Sony..."
                                    onChange={(e) =>
                                        actualizarCampo("genero", e.target.value)
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-700">
                                    Especificación / Capacidad
                                </label>

                                <input
                                    value={formulario.talla}
                                    placeholder="256 GB, 15.6'' IA, 65'' 4K..."
                                    onChange={(e) =>
                                        actualizarCampo("talla", e.target.value)
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-700">
                                    Código de barras
                                </label>

                                <input
                                    value={formulario.codigo_barras}
                                    placeholder="Ej: 7701001001"
                                    onChange={(e) =>
                                        actualizarCampo(
                                            "codigo_barras",
                                            e.target.value
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-700">
                                    Imagen del Producto (Ruta local / URL / Emoji)
                                </label>

                                <div className="mt-1 flex items-center gap-3">
                                    <input
                                        value={formulario.imagen_url}
                                        onChange={(e) =>
                                            actualizarCampo(
                                                "imagen_url",
                                                e.target.value
                                            )
                                        }
                                        placeholder="/images/productos/... o https://... o 📱"
                                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                    />
                                    <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs" title="Vista previa de imagen">
                                        <ProductImage
                                            src={formulario.imagen_url}
                                            alt="Vista previa"
                                            className="w-full h-full object-contain p-1"
                                            fallbackEmoji="⚡"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-1">
                                    Rutas locales soportadas (ej: <code className="text-blue-600 font-mono">/images/productos/iphone-16-pro-max-azul.png</code>), enlaces HTTPS o emojis.
                                </p>
                            </div>

                            {error && (
                                <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </p>
                            )}

                            <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={() => setModalAbierto(false)}
                                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm cursor-pointer transition-colors"
                                >
                                    {guardando
                                        ? "Guardando..."
                                        : productoEditando
                                            ? "Guardar cambios"
                                            : "Crear producto"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}