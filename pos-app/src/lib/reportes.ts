// src/lib/reportes.ts
import { pool } from "./db";

export interface ResumenVentasHora {
    hora: string;
    total_fisico: number;
    total_online: number;
    volumen_fisico: number;
    volumen_online: number;
    total_general: number;
}

export interface MedioPagoResumen {
    medio_pago: string;
    total: number;
    cantidad: number;
}

export interface TransaccionDiaria {
    id_venta: number;
    hora: string;
    canal: string;
    medio_pago: string;
    codigo_caja: string;
    cliente: string;
    vendedor: string;
    total: number;
    estado: string;
}

export interface ReporteDiarioData {
    fecha: string;
    fecha_formateada: string;
    total_dia: number;
    total_fisico: number;
    total_online: number;
    volumen_fisico: number;
    volumen_online: number;
    total_transacciones: number;
    ticket_promedio: number;
    por_hora: ResumenVentasHora[];
    por_medio_pago: MedioPagoResumen[];
    transacciones: TransaccionDiaria[];
}

// Retrocompatibilidad con el tipo anterior
export interface ResumenVentasDiarias extends ResumenVentasHora {
    fecha: string;
}

/**
 * Obtiene el reporte de ventas del día especificado (por defecto la fecha actual).
 */
export async function obtenerReporteDiario(fechaFiltro?: string): Promise<ReporteDiarioData> {
    // Si no se especifica fecha, se usa la fecha actual de Colombia (America/Bogota)
    const fechaRes = await pool.query(
        fechaFiltro
            ? "SELECT TO_CHAR($1::DATE, 'YYYY-MM-DD') as fecha_dia"
            : "SELECT TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD') as fecha_dia",
        fechaFiltro ? [fechaFiltro] : []
    );
    const fechaISO = fechaRes.rows[0].fecha_dia;

    // 1. Desglose horario del día en hora local
    const queryHoras = `
        SELECT 
            TO_CHAR(v.fecha AT TIME ZONE 'America/Bogota', 'HH24:00') as hora,
            SUM(CASE WHEN v.canal = 'FISICO' OR v.id_vendedor IS NOT NULL THEN v.total ELSE 0 END) as total_fisico,
            SUM(CASE WHEN v.canal = 'ONLINE' OR v.id_vendedor IS NULL THEN v.total ELSE 0 END) as total_online,
            COUNT(CASE WHEN v.canal = 'FISICO' OR v.id_vendedor IS NOT NULL THEN 1 END) as volumen_fisico,
            COUNT(CASE WHEN v.canal = 'ONLINE' OR v.id_vendedor IS NULL THEN 1 END) as volumen_online,
            SUM(v.total) as total_general
        FROM venta v
        WHERE (v.fecha AT TIME ZONE 'America/Bogota')::DATE = $1::DATE
        GROUP BY TO_CHAR(v.fecha AT TIME ZONE 'America/Bogota', 'HH24:00')
        ORDER BY hora ASC
    `;
    const resHoras = await pool.query(queryHoras, [fechaISO]);
    const ventasPorHoraMap = new Map<string, ResumenVentasHora>();
    for (const row of resHoras.rows) {
        ventasPorHoraMap.set(row.hora, {
            hora: row.hora,
            total_fisico: parseFloat(row.total_fisico || "0"),
            total_online: parseFloat(row.total_online || "0"),
            volumen_fisico: parseInt(row.volumen_fisico || "0", 10),
            volumen_online: parseInt(row.volumen_online || "0", 10),
            total_general: parseFloat(row.total_general || "0"),
        });
    }

    // Construir la curva de 24 horas (00:00 - 23:00) para un reporte horario continuo
    const por_hora: ResumenVentasHora[] = [];
    for (let h = 0; h < 24; h++) {
        const horaKey = `${h.toString().padStart(2, "0")}:00`;
        const dato = ventasPorHoraMap.get(horaKey) || {
            hora: horaKey,
            total_fisico: 0,
            total_online: 0,
            volumen_fisico: 0,
            volumen_online: 0,
            total_general: 0,
        };
        por_hora.push(dato);
    }

    // 2. Resumen por medio de pago
    const queryMedios = `
        SELECT 
            v.medio_pago,
            SUM(v.total) as total,
            COUNT(*) as cantidad
        FROM venta v
        WHERE (v.fecha AT TIME ZONE 'America/Bogota')::DATE = $1::DATE
        GROUP BY v.medio_pago
        ORDER BY total DESC
    `;
    const resMedios = await pool.query(queryMedios, [fechaISO]);
    const por_medio_pago: MedioPagoResumen[] = resMedios.rows.map((row) => ({
        medio_pago: row.medio_pago,
        total: parseFloat(row.total || "0"),
        cantidad: parseInt(row.cantidad || "0", 10),
    }));

    // 3. Listado detallado de transacciones del día
    const queryTransacciones = `
        SELECT 
            v.id_venta,
            TO_CHAR(v.fecha AT TIME ZONE 'America/Bogota', 'HH24:MI') as hora,
            v.canal,
            v.medio_pago,
            v.codigo_caja,
            COALESCE(u.nombre, 'Cliente General') as cliente,
            COALESCE(vend_u.nombre, 'Venta Online') as vendedor,
            v.total,
            v.estado
        FROM venta v
        LEFT JOIN usuario u ON u.id_usuario = v.id_cliente
        LEFT JOIN vendedor vend ON vend.id_usuario = v.id_vendedor
        LEFT JOIN usuario vend_u ON vend_u.id_usuario = vend.id_usuario
        WHERE (v.fecha AT TIME ZONE 'America/Bogota')::DATE = $1::DATE
        ORDER BY v.fecha DESC
    `;
    const resTx = await pool.query(queryTransacciones, [fechaISO]);
    const transacciones: TransaccionDiaria[] = resTx.rows.map((row) => ({
        id_venta: row.id_venta,
        hora: row.hora,
        canal: row.canal,
        medio_pago: row.medio_pago,
        codigo_caja: row.codigo_caja,
        cliente: row.cliente,
        vendedor: row.vendedor,
        total: parseFloat(row.total || "0"),
        estado: row.estado,
    }));

    // Cálculos de totales del día
    const total_fisico = por_hora.reduce((acc, h) => acc + h.total_fisico, 0);
    const total_online = por_hora.reduce((acc, h) => acc + h.total_online, 0);
    const volumen_fisico = por_hora.reduce((acc, h) => acc + h.volumen_fisico, 0);
    const volumen_online = por_hora.reduce((acc, h) => acc + h.volumen_online, 0);
    const total_dia = total_fisico + total_online;
    const total_transacciones = volumen_fisico + volumen_online;
    const ticket_promedio = total_transacciones > 0 ? total_dia / total_transacciones : 0;

    // Formatear fecha legible en español
    const fechaObj = new Date(fechaISO + "T12:00:00Z");
    const fecha_formateada = fechaObj.toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return {
        fecha: fechaISO,
        fecha_formateada,
        total_dia,
        total_fisico,
        total_online,
        volumen_fisico,
        volumen_online,
        total_transacciones,
        ticket_promedio,
        por_hora,
        por_medio_pago,
        transacciones,
    };
}

/**
 * Función compatible para vistas que llamen a obtenerReporteVentas.
 */
export async function obtenerReporteVentas(dias = 1): Promise<ResumenVentasHora[]> {
    const reporte = await obtenerReporteDiario();
    return reporte.por_hora;
}