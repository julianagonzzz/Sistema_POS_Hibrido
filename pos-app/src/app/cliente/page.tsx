import Link from "next/link";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerComprasCliente } from "@/lib/cliente";

function formatearPrecio(valor: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(valor);
}

function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default async function ClientePage() {
    const sesion = await obtenerSesion();

    // Si no hay sesión
    if (!sesion) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-md">
                    <div className="text-4xl mb-4">🔒</div>

                    <h1 className="text-xl font-bold text-slate-900">
                        Debes iniciar sesión
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        Inicia sesión para consultar tu perfil y tu historial de compras.
                    </p>

                    <Link
                        href="/login"
                        className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </main>
        );
    }

    // Solo los clientes pueden entrar a esta página
    if (sesion.tipo_usuario !== "CLIENTE") {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-md">
                    <div className="text-4xl mb-4">🚫</div>

                    <h1 className="text-xl font-bold text-slate-900">
                        Acceso no permitido
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        Esta sección es exclusiva para clientes.
                    </p>

                    <Link
                        href="/"
                        className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </main>
        );
    }

    // Obtenemos las compras del cliente autenticado
    const compras = await obtenerComprasCliente(sesion.id_usuario);

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            {/* Barra superior */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link
                        href="/catalogo"
                        className="flex items-center gap-2.5 group"
                    >
                        <img
                            src="/images/nexovolk-logo.png"
                            alt="NexoVolk"
                            className="w-10 h-10 rounded-xl object-contain shadow-xs"
                        />
                        <span className="text-xl font-black text-slate-900">
                            Nexo<span className="text-orange-500">Volk</span>
                        </span>
                    </Link>

                    <Link
                        href="/catalogo"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                        ← Volver al catálogo
                    </Link>
                </div>
            </header>

            {/* Contenido */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Título */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        Mi cuenta
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Consulta tus datos y tu historial de compras.
                    </p>
                </div>

                {/* Perfil */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl">
                            👤
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {sesion.nombre}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {sesion.correo}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Historial */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Historial de compras
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                {compras.length === 1
                                    ? "Has realizado 1 compra."
                                    : `Has realizado ${compras.length} compras.`}
                            </p>
                        </div>
                    </div>

                    {/* Sin compras */}
                    {compras.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="text-5xl mb-4">🛍️</div>

                            <h3 className="text-lg font-bold text-slate-900">
                                Todavía no tienes compras
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Explora nuestro catálogo y realiza tu primera compra.
                            </p>

                            <Link
                                href="/catalogo"
                                className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                            >
                                Ver catálogo
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {compras.map((compra) => (
                                <article
                                    key={compra.id_venta}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                                >
                                    {/* Encabezado de compra */}
                                    <div className="p-5 border-b border-slate-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    Compra #{compra.id_venta}
                                                </h3>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    {formatearFecha(compra.fecha)}
                                                </p>
                                            </div>

                                            <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                {compra.estado}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Productos */}
                                    <div className="p-5">
                                        <div className="space-y-4">
                                            {compra.productos.map((producto) => (
                                                <div
                                                    key={producto.id_producto}
                                                    className="flex items-center justify-between gap-4"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800">
                                                            {producto.nombre}
                                                        </p>

                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Cantidad: {producto.cantidad} ×{" "}
                                                            {formatearPrecio(producto.precio_unitario)}
                                                        </p>
                                                    </div>

                                                    <p className="font-bold text-slate-900 whitespace-nowrap">
                                                        {formatearPrecio(producto.subtotal)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Información de pago y total */}
                                        <div className="mt-5 pt-4 border-t border-slate-100">
                                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                                <div className="text-xs text-slate-500 space-y-1">
                                                    <p>
                                                        <span className="font-semibold">
                                                            Medio de pago:
                                                        </span>{" "}
                                                        {compra.medio_pago}
                                                    </p>

                                                    <p>
                                                        <span className="font-semibold">
                                                            Canal:
                                                        </span>{" "}
                                                        {compra.canal}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">
                                                        Total
                                                    </p>

                                                    <p className="text-xl font-extrabold text-indigo-600">
                                                        {formatearPrecio(compra.total)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}