"use client";

import { useState, useMemo } from "react";
import { Producto } from "@/lib/productos";
import { useCarrito } from "@/app/carrito/CarritoContext";

interface Props {
  productosIniciales: Producto[];
  categorias: string[];
}

function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const ICONOS_CATEGORIA: Record<string, string> = {
  "Todos": "🛍️",
  "Electrodomésticos": "🔌",
  "Aseo Personal": "🧼",
  "Alimentos": "🍎",
  "Moda": "👕",
};

export default function CatalogoCliente({ productosIniciales, categorias }: Props) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");

    // US_09: carrito de compras
  const { items: itemsCarrito, agregar } = useCarrito();
  const [avisos, setAvisos] = useState<Record<number, { ok: boolean; texto: string }>>({});
  function agregarAlCarrito(prod: Producto) {
    const r = agregar(prod, 1);
    setAvisos((prev) => ({
      ...prev,
      [prod.id_producto]: r.ok
        ? { ok: true, texto: "✓ Agregado al carrito" }
        : { ok: false, texto: r.mensaje ?? "No se pudo agregar." },
    }));
    // El aviso desaparece a los 2.5 segundos
    setTimeout(() => {
      setAvisos((prev) => {
        const copia = { ...prev };
        delete copia[prod.id_producto];
        return copia;
      });
    }, 2500);
  }

  const todasLasCategorias = ["Todos", ...categorias];

  const productosFiltrados = useMemo(() => {
    return productosIniciales.filter((prod) => {
      const coincideCategoria =
        categoriaSeleccionada === "Todos" || prod.categoria === categoriaSeleccionada;
      const coincideBusqueda =
        busqueda.trim() === "" ||
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (prod.descripcion && prod.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
        (prod.codigo_barras && prod.codigo_barras.toLowerCase().includes(busqueda.toLowerCase()));
      return coincideCategoria && coincideBusqueda;
    });
  }, [productosIniciales, categoriaSeleccionada, busqueda]);

  return (
    <div className="space-y-8">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Buscador de texto */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 select-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 self-center md:self-auto">
            Mostrando <strong>{productosFiltrados.length}</strong> de{" "}
            <strong>{productosIniciales.length}</strong> productos
          </div>
        </div>

        {/* Pestañas / Botones de Categorías */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {todasLasCategorias.map((cat) => {
            const icono = ICONOS_CATEGORIA[cat] || "🏷️";
            const activa = categoriaSeleccionada === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activa
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{icono}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Productos */}
      {productosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">No se encontraron productos</h3>
          <p className="text-sm text-slate-500 mt-1">
            Intenta con otro término de búsqueda o selecciona otra categoría.
          </p>
          <button
            onClick={() => {
              setCategoriaSeleccionada("Todos");
              setBusqueda("");
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((prod) => (
            <div
              key={prod.id_producto}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
            >
              {/* Imagen / Emoji */}
              <div className="h-44 bg-slate-100 flex items-center justify-center text-5xl relative select-none group-hover:scale-105 transition-transform duration-300">
                {prod.imagen_url || "🛍️"}
                <span
                  className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    prod.cantidad_stock > 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  {prod.cantidad_stock > 0 ? `Stock: ${prod.cantidad_stock}` : "Agotado"}
                </span>
                {(prod.talla || prod.genero) && (
                  <span className="absolute bottom-3 left-3 text-[11px] font-medium px-2 py-0.5 bg-white/90 text-slate-600 rounded-md backdrop-blur-xs shadow-xs">
                    {prod.talla && prod.talla !== "Única" ? `${prod.talla} • ` : ""}
                    {prod.genero}
                  </span>
                )}
              </div>

              {/* Detalle */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold uppercase tracking-wider text-indigo-600 text-[10px]">
                    {prod.categoria}
                  </span>
                  {prod.codigo_barras && (
                    <span className="font-mono text-[10px] text-slate-400">
                      {prod.codigo_barras}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                  {prod.nombre}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1 leading-relaxed">
                  {prod.descripcion || "Sin descripción disponible."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Precio
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatearPrecio(prod.precio)}
                    </span>
                  </div>

                                    <button
                    type="button"
                    onClick={() => agregarAlCarrito(prod)}
                    disabled={prod.cantidad_stock <= 0}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {prod.cantidad_stock <= 0
                      ? "Agotado"
                      : `🛒 Agregar${
                          (itemsCarrito.find((i) => i.id_producto === prod.id_producto)?.cantidad ?? 0) > 0
                            ? ` (${itemsCarrito.find((i) => i.id_producto === prod.id_producto)?.cantidad})`
                            : ""
                        }`}
                  </button>
                </div>
                {avisos[prod.id_producto] && (
                  <p
                    className={`mt-2 text-[11px] font-semibold ${
                      avisos[prod.id_producto].ok ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {avisos[prod.id_producto].texto}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
