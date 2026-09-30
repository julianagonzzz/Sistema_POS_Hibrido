// src/app/admin/reportes/GraficoVentas.tsx
"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart,
} from "recharts";

type GraficoVentasProps = {
    datos: Array<{
        fecha: string;
        total_fisico: number;
        total_online: number;
        volumen_fisico: number;
        volumen_online: number;
        total_general: number;
    }>;
};

export default function GraficoVentas({ datos }: GraficoVentasProps) {
    const formatoMoneda = (valor: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor);

    if (!datos || datos.length === 0) {
        return (
            <div className="w-full h-80 bg-white p-8 rounded-2xl border border-zinc-200 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-4xl mb-3">📊</span>
                <p className="font-semibold text-zinc-800">Aún no hay transacciones para graficar</p>
                <p className="text-sm text-zinc-500 mt-1">
                    Las ventas registradas en POS y tienda online aparecerán aquí organizadas por día.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-[460px] bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900">
                        Tendencia de Ingresos y Volumen
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        Barras: Ingresos COP (Eje izquierdo) · Líneas: Cantidad de transacciones (Eje derecho)
                    </p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={360}>
                <ComposedChart
                    data={datos}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 11, fill: "#71717a" }}
                        axisLine={{ stroke: "#e4e4e7" }}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="izquierda"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11, fill: "#71717a" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="derecha"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "#71717a" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e4e4e7",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            backgroundColor: "#ffffff",
                            padding: "10px 14px",
                        }}
                        formatter={(value: any, name: any) => {
                            if (typeof name === "string" && name.includes("Volumen")) {
                                return [Number(value || 0).toLocaleString("es-CO"), name];
                            }
                            return [formatoMoneda(Number(value || 0)), name];
                        }}
                        labelStyle={{ color: "#18181b", fontWeight: "bold", marginBottom: "6px" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }} />
                    <Bar
                        yAxisId="izquierda"
                        dataKey="total_fisico"
                        name="Ingresos Físicos (POS)"
                        stackId="a"
                        fill="#2563eb" /* NexoVolk Blue */
                        radius={[0, 0, 4, 4]}
                    />
                    <Bar
                        yAxisId="izquierda"
                        dataKey="total_online"
                        name="Ingresos Online"
                        stackId="a"
                        fill="#f97316" /* NexoVolk Orange */
                        radius={[4, 4, 0, 0]}
                    />
                    <Line
                        yAxisId="derecha"
                        type="monotone"
                        dataKey="volumen_fisico"
                        name="Volumen Físico (Tx)"
                        stroke="#1d4ed8" /* NexoVolk Dark Blue */
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#1d4ed8" }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        yAxisId="derecha"
                        type="monotone"
                        dataKey="volumen_online"
                        name="Volumen Online (Tx)"
                        stroke="#c2410c" /* NexoVolk Dark Orange */
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#c2410c" }}
                        activeDot={{ r: 5 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}