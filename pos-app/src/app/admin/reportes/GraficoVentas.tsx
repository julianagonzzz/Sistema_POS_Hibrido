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
    datos: any[];
};

export default function GraficoVentas({ datos }: GraficoVentasProps) {
    const formatoMoneda = (valor: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor);

    return (
        <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Tendencia de Ingresos y Volumen
            </h2>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={datos}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="izquierda"
                        tickFormatter={(value) => `$${value / 1000}k`}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="derecha"
                        orientation="right"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        formatter={(value: number, name: string) => {
                            if (name.includes("Volumen")) return [value, name];
                            return [formatoMoneda(value), name];
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                        yAxisId="izquierda"
                        dataKey="total_fisico"
                        name="Ingresos Físicos (POS)"
                        stackId="a"
                        fill="#4f46e5" /* Indigo-600 */
                        radius={[0, 0, 4, 4]}
                    />
                    <Bar
                        yAxisId="izquierda"
                        dataKey="total_online"
                        name="Ingresos Online"
                        stackId="a"
                        fill="#10b981" /* Emerald-500 */
                        radius={[4, 4, 0, 0]}
                    />
                    <Line
                        yAxisId="derecha"
                        type="monotone"
                        dataKey="volumen_fisico"
                        name="Volumen Físico (Tx)"
                        stroke="#312e81" /* Indigo-900 */
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="derecha"
                        type="monotone"
                        dataKey="volumen_online"
                        name="Volumen Online (Tx)"
                        stroke="#064e3b" /* Emerald-900 */
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}