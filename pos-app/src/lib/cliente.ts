import { query } from "@/lib/db";

export type CompraCliente = {
    id_venta: number;
    fecha: string;
    subtotal: number;
    impuesto: number;
    total: number;
    estado: string;
    medio_pago: string;
    canal: string;
    productos: {
        id_producto: number;
        nombre: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
    }[];
};

export async function obtenerComprasCliente(
    idUsuario: string
): Promise<CompraCliente[]> {
    const resultado = await query(
        `
      SELECT
        v.id_venta,
        v.fecha,
        v.subtotal,
        v.impuesto,
        v.total,
        v.estado,
        v.medio_pago,
        v.canal,
        dv.id_producto,
        p.nombre,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal AS subtotal_detalle
      FROM venta v
      JOIN detalle_venta dv
        ON v.id_venta = dv.id_venta
      JOIN producto p
        ON dv.id_producto = p.id_producto
      WHERE v.id_cliente = $1
      ORDER BY v.fecha DESC, v.id_venta DESC
    `,
        [idUsuario]
    );

    const compras = new Map<number, CompraCliente>();

    for (const fila of resultado.rows) {
        if (!compras.has(fila.id_venta)) {
            compras.set(fila.id_venta, {
                id_venta: fila.id_venta,
                fecha: fila.fecha,
                subtotal: Number(fila.subtotal),
                impuesto: Number(fila.impuesto),
                total: Number(fila.total),
                estado: fila.estado,
                medio_pago: fila.medio_pago,
                canal: fila.canal,
                productos: [],
            });
        }

        compras.get(fila.id_venta)!.productos.push({
            id_producto: fila.id_producto,
            nombre: fila.nombre,
            cantidad: fila.cantidad,
            precio_unitario: Number(fila.precio_unitario),
            subtotal: Number(fila.subtotal_detalle),
        });
    }

    return Array.from(compras.values());
}