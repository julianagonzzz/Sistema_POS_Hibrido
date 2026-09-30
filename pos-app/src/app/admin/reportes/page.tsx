// src/app/admin/reportes/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerReporteVentas } from "@/lib/reportes";
import GraficoVentas from "./GraficoVentas";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
    // 1. Validar seguridad: Solo el administrador puede ver esta página
    const sesion = await obtenerSesion();
    if (!sesion || sesion.tipo_usuario !== "ADMIN") {
        redirect("/login");
    }

    // 2. Obtener datos de los últimos 30 días
    const datosVentas = await obtenerReporteVentas(30);

    // 3. Cálculos para los KPIs
    const totalMensual = datosVentas.reduce((acc, dia) => acc + dia.total_general, 0);
    const totalFisico = datosVentas.reduce((acc, dia) => acc + dia.total_fisico, 0);
    const totalOnline = datosVentas.reduce((acc, dia) => acc + dia.total_online, 0);
    const totalTxFisicas = datosVentas.reduce((acc, dia) => acc + dia.volumen_fisico, 0);
    const totalTxOnline = datosVentas.reduce((acc, dia) => acc + dia.volumen_online, 0);
    const totalTransacciones = totalTxFisicas + totalTxOnline;

    const formatoMoneda = (valor: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

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
                                <span className="text-sm font-semibold text-zinc-600">· Reportes y Métricas</span>
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

                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Rendimiento Comercial (Últimos 30 días)</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        Análisis comparativo de ingresos y volumen transaccional entre canal físico (POS) y tienda online.
                    </p>
                </div>

                {/* Tarjetas de Indicadores / KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Ingresos Totales (30d)
                        </span>
                        <p className="text-2xl font-black text-zinc-900 mt-2">{formatoMoneda(totalMensual)}</p>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                            {totalTransacciones} transacciones en total
                        </p>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                Canal Físico (POS)
                            </span>
                            <span className="text-base">🏪</span>
                        </div>
                        <p className="text-2xl font-black text-blue-600 mt-2">{formatoMoneda(totalFisico)}</p>
                        <p className="text-xs text-blue-800/80 mt-1 font-medium">
                            {totalTxFisicas} tickets de venta
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                                Tienda Online
                            </span>
                            <span className="text-base">🛒</span>
                        </div>
                        <p className="text-2xl font-black text-orange-500 mt-2">{formatoMoneda(totalOnline)}</p>
                        <p className="text-xs text-orange-800/80 mt-1 font-medium">
                            {totalTxOnline} pedidos web
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Participación Online
                        </span>
                        <p className="text-2xl font-black text-zinc-800 mt-2">
                            {totalMensual > 0 ? ((totalOnline / totalMensual) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                            del total de ingresos recaudados
                        </p>
                    </div>
                </div>

                {/* Gráfico principal */}
                <GraficoVentas datos={datosVentas} />
            </div>
        </main>
    );
}