// src/app/admin/reportes/page.tsx
import { redirect } from "next/navigation";
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
    const totalTxFisicas = datosVentas.reduce((acc, dia) => acc + dia.volumen_fisico, 0);
    const totalTxOnline = datosVentas.reduce((acc, dia) => acc + dia.volumen_online, 0);

    const formatoMoneda = (valor: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            <header className="border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard de Ventas</h1>
                <p className="text-gray-500 mt-1 text-lg">
                    Rendimiento comparativo de canales físicos vs. online (Últimos 30 días).
                </p>
            </header>

            {/* Tarjetas de Indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Ingresos Totales (30d)
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatoMoneda(totalMensual)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Transacciones Físicas
                    </h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{totalTxFisicas}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Transacciones Online
                    </h3>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{totalTxOnline}</p>
                </div>
            </div>

            {/* Gráfico principal */}
            <GraficoVentas datos={datosVentas} />
        </div>
    );
}