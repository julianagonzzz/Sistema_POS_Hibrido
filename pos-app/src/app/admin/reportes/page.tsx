// src/app/admin/reportes/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerReporteDiario } from "@/lib/reportes";
import GraficoVentas from "./GraficoVentas";

export const dynamic = "force-dynamic";

type Props = {
    searchParams?: Promise<{ fecha?: string }>;
};

export default async function ReportesPage({ searchParams }: Props) {
    // 1. Validar seguridad: Solo el administrador puede ver esta página
    const sesion = await obtenerSesion();
    if (!sesion || sesion.tipo_usuario !== "ADMIN") {
        redirect("/login");
    }

    const params = searchParams ? await searchParams : {};
    const fechaFiltro = typeof params?.fecha === "string" && params.fecha.trim().length > 0
        ? params.fecha.trim()
        : undefined;

    // 2. Obtener datos del reporte diario
    const reporte = await obtenerReporteDiario(fechaFiltro);

    const formatoMoneda = (valor: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor);

    return (
        <main className="flex-1 bg-zinc-50 min-h-screen px-6 py-10">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header corporativo NexoVolk */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/nexovolk-logo.png"
                            alt="NexoVolk"
                            className="w-11 h-11 rounded-xl object-contain shadow-xs"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                                    Nexo<span className="text-orange-500">Volk</span>
                                </h1>
                                <span className="text-sm font-semibold text-zinc-600">· Reporte Diario de Ventas</span>
                            </div>
                            <p className="text-xs text-zinc-500">Sesión activa: {sesion.nombre}</p>
                        </div>
                    </div>

                    <Link
                        href="/admin"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <span>← Volver al Panel Admin</span>
                    </Link>
                </header>

                {/* Barra de control: Título de fecha y selector */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                            Reporte del Día
                        </span>
                        <h2 className="text-xl font-bold text-zinc-900 capitalize mt-1.5">
                            {reporte.fecha_formateada}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Métricas consolidadas de caja POS y compras online en la fecha seleccionada.
                        </p>
                    </div>

                    {/* Selector de fecha */}
                    <form method="GET" className="flex items-center gap-2">
                        <label htmlFor="fecha" className="text-xs font-semibold text-zinc-600">
                            Fecha:
                        </label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            defaultValue={reporte.fecha}
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-xs"
                        >
                            Filtrar
                        </button>
                    </form>
                </div>

                {/* Tarjetas de Indicadores / KPIs del Día */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Total Facturado Hoy
                        </span>
                        <p className="text-2xl font-black text-zinc-900 mt-2">{formatoMoneda(reporte.total_dia)}</p>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                            {reporte.total_transacciones} transacciones en el día
                        </p>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                POS Físico (Caja)
                            </span>
                            <span className="text-base">🏪</span>
                        </div>
                        <p className="text-2xl font-black text-blue-600 mt-2">{formatoMoneda(reporte.total_fisico)}</p>
                        <p className="text-xs text-blue-800/80 mt-1 font-medium">
                            {reporte.volumen_fisico} tickets generados
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                                Tienda Online
                            </span>
                            <span className="text-base">🛒</span>
                        </div>
                        <p className="text-2xl font-black text-orange-500 mt-2">{formatoMoneda(reporte.total_online)}</p>
                        <p className="text-xs text-orange-800/80 mt-1 font-medium">
                            {reporte.volumen_online} pedidos confirmados
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Ticket Promedio
                        </span>
                        <p className="text-2xl font-black text-zinc-800 mt-2">{formatoMoneda(reporte.ticket_promedio)}</p>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                            por compra realizada hoy
                        </p>
                    </div>
                </div>

                {/* Gráfico horario del día */}
                <GraficoVentas datos={reporte.por_hora} />

                {/* Desglose por Medios de Pago */}
                {reporte.por_medio_pago.length > 0 && (
                    <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                        <div className="border-b border-zinc-100 pb-3">
                            <h3 className="text-base font-bold text-zinc-900">Distribución por Medio de Pago (Hoy)</h3>
                            <p className="text-xs text-zinc-500">Recaudación clasificada por forma de pago recibida.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {reporte.por_medio_pago.map((mp) => (
                                <div key={mp.medio_pago} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3.5">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        {mp.medio_pago}
                                    </span>
                                    <p className="text-lg font-black text-zinc-900 mt-1">{formatoMoneda(mp.total)}</p>
                                    <span className="text-xs text-zinc-500">{mp.cantidad} {mp.cantidad === 1 ? "operación" : "operaciones"}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Detalle de transacciones del día */}
                <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div>
                            <h3 className="text-base font-bold text-zinc-900">Transacciones del Día</h3>
                            <p className="text-xs text-zinc-500">Historial cronológico de tickets emitidos en la fecha.</p>
                        </div>
                        <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
                            Total: {reporte.transacciones.length}
                        </span>
                    </div>

                    {reporte.transacciones.length === 0 ? (
                        <p className="py-8 text-center text-sm text-zinc-400">
                            No se registraron ventas en esta fecha.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-zinc-600">
                                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase font-semibold">
                                    <tr>
                                        <th className="py-2.5 px-3">Hora</th>
                                        <th className="py-2.5 px-3">Canal</th>
                                        <th className="py-2.5 px-3">Caja / Vendedor</th>
                                        <th className="py-2.5 px-3">Cliente</th>
                                        <th className="py-2.5 px-3">Medio de Pago</th>
                                        <th className="py-2.5 px-3 text-right">Total</th>
                                        <th className="py-2.5 px-3 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {reporte.transacciones.map((tx) => (
                                        <tr key={tx.id_venta} className="hover:bg-zinc-50/80 transition-colors">
                                            <td className="py-3 px-3 font-semibold text-zinc-900 whitespace-nowrap">
                                                {tx.hora}
                                            </td>
                                            <td className="py-3 px-3">
                                                {tx.canal === "FISICO" ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                        🏪 POS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                                                        🛒 Online
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3">
                                                <p className="font-medium text-zinc-800">{tx.vendedor}</p>
                                                <span className="text-[10px] text-zinc-400">{tx.codigo_caja}</span>
                                            </td>
                                            <td className="py-3 px-3 font-medium text-zinc-700">
                                                {tx.cliente}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="font-medium text-zinc-700 uppercase text-[11px]">
                                                    {tx.medio_pago}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-black text-zinc-900 whitespace-nowrap">
                                                {formatoMoneda(tx.total)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                                                    {tx.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}