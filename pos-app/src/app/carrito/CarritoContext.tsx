"use client";

// US_09 - Estado global del carrito de compras en el navegador.
// - Se guarda en localStorage con una clave por usuario (carrito_<id>) o
//   "carrito_invitado" si no hay sesión, así persiste mientras la sesión esté activa.
// - Al iniciar sesión, lo que el visitante tenía en el carrito se fusiona con el
//   carrito del usuario.
// - validar() consulta /api/carrito/validar para detectar cambios externos de
//   stock/precio y ajustar el carrito.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ItemCarrito, AlteracionCarrito } from "@/lib/carrito";

const CLAVE_INVITADO = "carrito_invitado";

type ProductoAgregable = {
  id_producto: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  categoria: string;
  cantidad_stock: number;
};

type ResultadoAccion = { ok: boolean; mensaje?: string };

interface CarritoContextValue {
  items: ItemCarrito[];
  cantidadTotal: number; // unidades
  total: number; // impuestos incluidos en el precio
  cargado: boolean;
  alteraciones: AlteracionCarrito[];
  validando: boolean;
  agregar: (producto: ProductoAgregable, cantidad?: number) => ResultadoAccion;
  cambiarCantidad: (id_producto: number, cantidad: number) => ResultadoAccion;
  remover: (id_producto: number) => void;
  vaciar: () => void;
  validar: () => Promise<void>;
  descartarAlteraciones: () => void;
}

const CarritoContext = createContext<CarritoContextValue | null>(null);

function leer(clave: string): ItemCarrito[] {
  try {
    const crudo = localStorage.getItem(clave);
    const datos = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function escribir(clave: string, items: ItemCarrito[]) {
  try {
    if (items.length === 0) localStorage.removeItem(clave);
    else localStorage.setItem(clave, JSON.stringify(items));
  } catch {
    // Almacenamiento no disponible (modo privado, etc.): el carrito vive solo en memoria
  }
}

function fusionar(base: ItemCarrito[], extra: ItemCarrito[]): ItemCarrito[] {
  const resultado = [...base];
  for (const it of extra) {
    const i = resultado.findIndex((r) => r.id_producto === it.id_producto);
    if (i >= 0) {
      const tope = Math.max(resultado[i].stock_disponible, it.stock_disponible);
      resultado[i] = { ...resultado[i], cantidad: Math.min(resultado[i].cantidad + it.cantidad, tope) };
    } else {
      resultado.push(it);
    }
  }
  return resultado;
}

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [clave, setClave] = useState<string | null>(null);
  const [alteraciones, setAlteraciones] = useState<AlteracionCarrito[]>([]);
  const [validando, setValidando] = useState(false);
  const itemsRef = useRef(items);
  const claveRef = useRef<string | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 1. Averiguar quién está logueado y cargar su carrito. Se repite al cambiar de
  //    página porque el login/logout navega sin recargar y el usuario puede cambiar.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      let idUsuario: string | null = null;
      try {
        const res = await fetch("/api/auth/sesion", { cache: "no-store" });
        const datos = await res.json();
        idUsuario = datos?.usuario?.id_usuario ?? null;
      } catch {
        // sin conexión: se usa el carrito de invitado
      }
      if (cancelado) return;

      const claveUsuario = idUsuario ? `carrito_${idUsuario}` : CLAVE_INVITADO;
      if (claveUsuario === claveRef.current) return; // mismo usuario: nada que recargar

      let iniciales = leer(claveUsuario);
      if (idUsuario) {
        const invitado = leer(CLAVE_INVITADO);
        if (invitado.length > 0) {
          iniciales = fusionar(iniciales, invitado);
          escribir(CLAVE_INVITADO, []);
        }
      }
      claveRef.current = claveUsuario;
      setItems(iniciales);
      setAlteraciones([]);
      setClave(claveUsuario);
    })();
    return () => {
      cancelado = true;
    };
  }, [pathname]);

  // 2. Guardar en localStorage cada vez que cambia (solo cuando ya se cargó)
  useEffect(() => {
    if (clave) escribir(clave, items);
  }, [items, clave]);

  // 3. Sincronizar entre pestañas del mismo navegador
  useEffect(() => {
    if (!clave) return;
    const alCambiar = (e: StorageEvent) => {
      if (e.key === clave) setItems(leer(clave));
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, [clave]);

  const agregar = useCallback((producto: ProductoAgregable, cantidad = 1): ResultadoAccion => {
    if (producto.cantidad_stock <= 0) return { ok: false, mensaje: "Producto agotado." };
    const existente = itemsRef.current.find((i) => i.id_producto === producto.id_producto);
    const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad;
    if (nuevaCantidad > producto.cantidad_stock) {
      return { ok: false, mensaje: `Solo hay ${producto.cantidad_stock} unidades disponibles.` };
    }
    setItems((prev) => {
      const item: ItemCarrito = {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
        categoria: producto.categoria,
        cantidad: nuevaCantidad,
        stock_disponible: producto.cantidad_stock,
      };
      return existente ? prev.map((i) => (i.id_producto === item.id_producto ? item : i)) : [...prev, item];
    });
    return { ok: true };
  }, []);

  const cambiarCantidad = useCallback((id_producto: number, cantidad: number): ResultadoAccion => {
    const item = itemsRef.current.find((i) => i.id_producto === id_producto);
    if (!item) return { ok: false };
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => i.id_producto !== id_producto));
      return { ok: true };
    }
    if (cantidad > item.stock_disponible) {
      return { ok: false, mensaje: `Máximo ${item.stock_disponible} unidades disponibles.` };
    }
    setItems((prev) => prev.map((i) => (i.id_producto === id_producto ? { ...i, cantidad } : i)));
    return { ok: true };
  }, []);

  const remover = useCallback((id_producto: number) => {
    setItems((prev) => prev.filter((i) => i.id_producto !== id_producto));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  // Compara el carrito con la BD y aplica las correcciones
  const validar = useCallback(async () => {
    const actuales = itemsRef.current;
    if (actuales.length === 0) return;
    setValidando(true);
    try {
      const res = await fetch("/api/carrito/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: actuales.map(({ id_producto, cantidad, nombre, precio }) => ({ id_producto, cantidad, nombre, precio })),
        }),
      });
      if (!res.ok) return;
      const datos: { items: ItemCarrito[]; alteraciones: AlteracionCarrito[] } = await res.json();
      setItems(datos.items);
      if (datos.alteraciones.length > 0) {
        setAlteraciones((prev) => {
          const claves = new Set(prev.map((a) => `${a.id_producto}-${a.tipo}`));
          return [...prev, ...datos.alteraciones.filter((a) => !claves.has(`${a.id_producto}-${a.tipo}`))];
        });
      }
    } catch {
      // sin conexión: se conserva el carrito tal cual
    } finally {
      setValidando(false);
    }
  }, []);

  const descartarAlteraciones = useCallback(() => setAlteraciones([]), []);

  const valor = useMemo<CarritoContextValue>(() => {
    const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
    const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    return {
      items,
      cantidadTotal,
      total,
      cargado: clave !== null,
      alteraciones,
      validando,
      agregar,
      cambiarCantidad,
      remover,
      vaciar,
      validar,
      descartarAlteraciones,
    };
  }, [items, clave, alteraciones, validando, agregar, cambiarCantidad, remover, vaciar, validar, descartarAlteraciones]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): CarritoContextValue {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>.");
  return ctx;
}

/** Icono con contador para la barra de navegación. */
export function BotonCarrito() {
  const { cantidadTotal } = useCarrito();
  return (
    <Link
      href="/carrito"
      className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      aria-label={`Carrito de compras, ${cantidadTotal} productos`}
    >
      <span className="text-lg">🛒</span>
      <span className="hidden sm:inline">Carrito</span>
      {cantidadTotal > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
          {cantidadTotal}
        </span>
      )}
    </Link>
  );
}