'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Producto,
  Cliente,
  Venta,
  ItemCarrito,
  CanalVenta,
  MedioPago,
  VentaItem,
} from '@/lib/types';
import { INITIAL_PRODUCTOS, INITIAL_CLIENTES, INITIAL_VENTAS } from '@/lib/mock-data';
import { useAuth } from './AuthContext';

interface PosContextType {
  productos: Producto[];
  clientes: Cliente[];
  ventas: Venta[];
  carrito: ItemCarrito[];
  canal: CanalVenta;
  clienteActivo: Cliente;
  ticketActivo: Venta | null;
  subtotal: number;
  impuesto: number;
  total: number;
  totalItems: number;
  setCanal: (canal: CanalVenta) => void;
  setClienteActivo: (cliente: Cliente) => void;
  setTicketActivo: (venta: Venta | null) => void;
  agregarAlCarrito: (producto: Producto, cantidad?: number) => { success: boolean; error?: string };
  actualizarCantidadItem: (id_producto: string, cantidad: number) => { success: boolean; error?: string };
  eliminarDelCarrito: (id_producto: string) => void;
  vaciarCarrito: () => void;
  registrarClienteRapido: (datos: { cedula: string; nombre: string; telefono?: string; direccion?: string }) => Cliente;
  finalizarVenta: (medio_pago: MedioPago, pago_recibido?: number, notas?: string) => { success: boolean; venta?: Venta; error?: string };
  getStockDisponible: (id_producto: string) => number;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, currentVendedor } = useAuth();

  const [productos, setProductos] = useState<Producto[]>(INITIAL_PRODUCTOS);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [ventas, setVentas] = useState<Venta[]>(INITIAL_VENTAS);

  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [canal, setCanal] = useState<CanalVenta>('FISICO');
  const [clienteActivo, setClienteActivo] = useState<Cliente>(() => INITIAL_CLIENTES[0]);
  const [ticketActivo, setTicketActivo] = useState<Venta | null>(null);

  // Calcula stock disponible restando las unidades ya cargadas en el carrito activo
  const getStockDisponible = (id_producto: string): number => {
    const prod = productos.find((p) => p.id_producto === id_producto);
    if (!prod) return 0;
    const enCarrito = carrito.find((item) => item.producto.id_producto === id_producto)?.cantidad || 0;
    return Math.max(0, prod.cantidad_stock - enCarrito);
  };

  const agregarAlCarrito = (producto: Producto, cantidad = 1) => {
    const stockActual = productos.find((p) => p.id_producto === producto.id_producto)?.cantidad_stock || 0;
    const itemExistente = carrito.find((item) => item.producto.id_producto === producto.id_producto);
    const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
    const nuevaCantidad = cantidadEnCarrito + cantidad;

    if (nuevaCantidad > stockActual) {
      return {
        success: false,
        error: `Stock insuficiente. Disponible: ${stockActual - cantidadEnCarrito} unidad(es).`,
      };
    }

    if (itemExistente) {
      setCarrito((prev) =>
        prev.map((item) =>
          item.producto.id_producto === producto.id_producto
            ? {
                ...item,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * item.producto.precio,
              }
            : item
        )
      );
    } else {
      setCarrito((prev) => [
        ...prev,
        {
          producto,
          cantidad,
          subtotal: cantidad * producto.precio,
        },
      ]);
    }

    return { success: true };
  };

  const actualizarCantidadItem = (id_producto: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id_producto);
      return { success: true };
    }

    const prod = productos.find((p) => p.id_producto === id_producto);
    if (!prod) return { success: false, error: 'Producto no encontrado' };

    if (cantidad > prod.cantidad_stock) {
      return {
        success: false,
        error: `Máximo disponible: ${prod.cantidad_stock} unidad(es).`,
      };
    }

    setCarrito((prev) =>
      prev.map((item) =>
        item.producto.id_producto === id_producto
          ? {
              ...item,
              cantidad,
              subtotal: cantidad * item.producto.precio,
            }
          : item
      )
    );
    return { success: true };
  };

  const eliminarDelCarrito = (id_producto: string) => {
    setCarrito((prev) => prev.filter((item) => item.producto.id_producto !== id_producto));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const registrarClienteRapido = (datos: {
    cedula: string;
    nombre: string;
    telefono?: string;
    direccion?: string;
  }): Cliente => {
    const existing = clientes.find((c) => c.cedula === datos.cedula.trim());
    if (existing) {
      setClienteActivo(existing);
      return existing;
    }

    const nuevoCliente: Cliente = {
      id_usuario: `usr_cli_${Date.now()}`,
      cedula: datos.cedula.trim(),
      nombre: datos.nombre.trim(),
      telefono: datos.telefono?.trim() || 'No registrado',
      direccion: datos.direccion?.trim() || (canal === 'VIRTUAL' ? 'Por coordinar' : 'Mostrador'),
    };

    setClientes((prev) => [nuevoCliente, ...prev]);
    setClienteActivo(nuevoCliente);
    return nuevoCliente;
  };

  // Totales
  const { total, subtotal, impuesto, totalItems } = useMemo(() => {
    const totalVenta = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    const sub = Math.round(totalVenta / 1.19);
    const imp = totalVenta - sub;
    const itemsCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    return { total: totalVenta, subtotal: sub, impuesto: imp, totalItems: itemsCount };
  }, [carrito]);

  const finalizarVenta = (
    medio_pago: MedioPago,
    pago_recibido?: number,
    notas?: string
  ): { success: boolean; venta?: Venta; error?: string } => {
    if (carrito.length === 0) {
      return { success: false, error: 'El carrito está vacío' };
    }

    // Validar stock una última vez
    for (const item of carrito) {
      const prod = productos.find((p) => p.id_producto === item.producto.id_producto);
      if (!prod || prod.cantidad_stock < item.cantidad) {
        return {
          success: false,
          error: `Stock insuficiente para ${item.producto.nombre}`,
        };
      }
    }

    // Descontar inventario reactivo
    setProductos((prev) =>
      prev.map((prod) => {
        const itemEnCarrito = carrito.find((item) => item.producto.id_producto === prod.id_producto);
        if (itemEnCarrito) {
          return {
            ...prod,
            cantidad_stock: prod.cantidad_stock - itemEnCarrito.cantidad,
          };
        }
        return prod;
      })
    );

    const itemsVenta: VentaItem[] = carrito.map((item) => ({
      id_producto: item.producto.id_producto,
      nombre: item.producto.nombre,
      talla: item.producto.talla,
      cantidad: item.cantidad,
      precio_unitario: item.producto.precio,
      subtotal: item.subtotal,
    }));

    const cambioCalculado =
      medio_pago === 'EFECTIVO' && pago_recibido && pago_recibido >= total
        ? pago_recibido - total
        : 0;

    const nuevaVenta: Venta = {
      id_venta: `VENTA-${1000 + ventas.length + 1}`,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      medio_pago,
      canal,
      subtotal,
      impuesto,
      total,
      id_cliente: clienteActivo.id_usuario,
      cliente_nombre: clienteActivo.nombre,
      cliente_cedula: clienteActivo.cedula,
      id_vendedor: currentUser.id,
      vendedor_nombre: currentUser.nombre,
      codigo_caja: currentVendedor?.codigo_caja || 'CAJA-VIRTUAL',
      items: itemsVenta,
      pago_recibido: medio_pago === 'EFECTIVO' ? pago_recibido : total,
      cambio: cambioCalculado,
      notas: notas || (canal === 'VIRTUAL' ? `Entrega a: ${clienteActivo.direccion}` : undefined),
    };

    setVentas((prev) => [nuevaVenta, ...prev]);
    setTicketActivo(nuevaVenta);
    vaciarCarrito();

    // Resetear a cliente mostrador por defecto para la siguiente venta rápida
    setClienteActivo(INITIAL_CLIENTES[0]);

    return { success: true, venta: nuevaVenta };
  };

  return (
    <PosContext.Provider
      value={{
        productos,
        clientes,
        ventas,
        carrito,
        canal,
        clienteActivo,
        ticketActivo,
        subtotal,
        impuesto,
        total,
        totalItems,
        setCanal,
        setClienteActivo,
        setTicketActivo,
        agregarAlCarrito,
        actualizarCantidadItem,
        eliminarDelCarrito,
        vaciarCarrito,
        registrarClienteRapido,
        finalizarVenta,
        getStockDisponible,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos debe ser usado dentro de un PosProvider');
  }
  return context;
}
