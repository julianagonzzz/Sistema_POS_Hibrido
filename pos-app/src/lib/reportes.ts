// src/lib/reportes.ts
import { pool } from "./db";

export interface ResumenVentasDiarias {
    fecha: string;
    total_fisico: number;
    total_online: number;
    volumen_fisico: number;
    volumen_online: number;
    total_general: number;
}

export async function obtenerReporteVentas(
    dias = 30
): Promise<ResumenVentasDiarias[]> {
    // Nota: Usamos v.fecha y el campo id_vendedor en la tabla venta para diferenciar
    // ventas físicas de online. Si tu campo de fecha incluye hora, el CAST a DATE lo trunca.
    const consulta = `
    SELECT 
      TO_CHAR(v.fecha::DATE, 'YYYY-MM-DD') as fecha,
      SUM(CASE WHEN v.id_vendedor IS NOT NULL THEN v.total ELSE 0 END) as total_fisico,
      SUM(CASE WHEN v.id_vendedor IS NULL THEN v.total ELSE 0 END) as total_online,
      COUNT(CASE WHEN v.id_vendedor IS NOT NULL THEN 1 END) as volumen_fisico,
      COUNT(CASE WHEN v.id_vendedor IS NULL THEN 1 END) as volumen_online,
      SUM(v.total) as total_general
    FROM venta v
    WHERE v.fecha >= CURRENT_DATE - $1::interval
    GROUP BY v.fecha::DATE
    ORDER BY v.fecha::DATE ASC
  `;

    // Pasamos los días como intervalo dinámico, ej: '30 days'
    const { rows } = await pool.query(consulta, [`${dias} days`]);

    return rows.map((row) => ({
        fecha: row.fecha,
        total_fisico: parseFloat(row.total_fisico || "0"),
        total_online: parseFloat(row.total_online || "0"),
        volumen_fisico: parseInt(row.volumen_fisico || "0", 10),
        volumen_online: parseInt(row.volumen_online || "0", 10),
        total_general: parseFloat(row.total_general || "0"),
    }));
}