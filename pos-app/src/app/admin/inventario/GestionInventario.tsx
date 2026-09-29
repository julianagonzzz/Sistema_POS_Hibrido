"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ProductoInventario, ResumenInventario } from "@/lib/inventario";

function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function GestionInventario() {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [resumen, setResumen] = useState<ResumenInventario>({
    total_productos: 0,
    total_agotados: 0,
    total_criticos: 0,
    total_normales: 0,
    total_unidades: 0,
  });
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros (Criterio 4: pestaña o filtro rápido para reposición urgente)
  const [pestanaFiltro, setPestanaFiltro] = useState<"todos" | "urgentes">("todos");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");

  // Estado para el modal de Reposición (Criterios 1 y 5)
  const [productoAReponer, setProductoAReponer] = useState<ProductoInventario | null>(null);
  const [cantidadReposicion, setCantidadReposicion] = useState<string>("10");
  const [guardandoReposicion, setGuardandoReposicion] = useState(false);
  const [errorReposicion, setErrorReposicion] = useState<string | null>(null);

  // Estado para el modal/diálogo de Edición de Stock Mínimo (Criterio 2)
  const [productoAEditarUmbral, setProductoAEditarUmbral] = useState<ProductoInventario | null>(null);
  const [nuevoStockMinimo, setNuevoStockMinimo] = useState<string>("5");
  const [guardandoUmbral, setGuardandoUmbral] = useState(false);
  const [errorUmbral, setErrorUmbral] = useState<string | null>(null);

  const cargarInventario = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch("/api/admin/inventario");
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.error ?? "No fue posible cargar el inventario.");
        return;
      }
      setProductos(datos.productos ?? []);
      setResumen(datos.resumen ?? {
        total_productos: 0,
        total_agotados: 0,
        total_criticos: 0,
        total_normales: 0,
        total_unidades: 0,
      });
      setCategorias(datos.categorias ?? []);
    } catch {
      setError("Error de conexión al cargar el inventario.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  // Criterio 4: Filtrado dinámico según pestaña rápida ("todos" vs "urgentes"), categoría y texto
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      // Filtro urgente: productos agotados (stock = 0) o críticos (stock <= stock_minimo)
      if (pestanaFiltro === "urgentes") {
        if (prod.estado_stock !== "AGOTADO" && prod.estado_stock !== "CRITICO") {
          return false;
        }
      }

      // Filtro de categoría
      if (categoriaSeleccionada !== "Todos" && prod.categoria !== categoriaSeleccionada) {
        return false;
      }

      // Filtro por búsqueda
      if (busqueda.trim() !== "") {
        const q = busqueda.toLowerCase().trim();
        const coincideNombre = prod.nombre.toLowerCase().includes(q);
        const coincideCodigo = prod.codigo_barras?.toLowerCase().includes(q) ?? false;
        const coincideCategoria = prod.categoria.toLowerCase().includes(q);
        if (!coincideNombre && !coincideCodigo && !coincideCategoria) {
          return false;
        }
      }

      return true;
    });
  }, [productos, pestanaFiltro, categoriaSeleccionada, busqueda]);

  // Manejo de Reposición (Criterios 1 y 5)
  function abrirModalReposicion(prod: ProductoInventario) {
    setProductoAReponer(prod);
    setCantidadReposicion("10"); // Valor sugerido conveniente
    setErrorReposicion(null);
  }

  async function ejecutarReposicion(e: React.FormEvent) {
    e.preventDefault();
    if (!productoAReponer) return;

    const cantidadNum = parseInt(cantidadReposicion, 10);

    // Validación Criterio 5 en cliente: no permitir cantidades negativas ni cero
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setErrorReposicion("Debes ingresar una cantidad entera mayor a 0.");
      return;
    }

    setGuardandoReposicion(true);
    setErrorReposicion(null);

    try {
      const respuesta = await fetch("/api/admin/inventario/reposicion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: productoAReponer.id_producto,
          cantidad: cantidadNum,
        }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setErrorReposicion(datos.error ?? "No se pudo realizar la reposición.");
        return;
      }

      setMensajeExito(datos.mensaje ?? "Reposición realizada exitosamente.");
      setProductoAReponer(null);
      await cargarInventario();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setErrorReposicion("Error de conexión al procesar la reposición.");
    } finally {
      setGuardandoReposicion(false);
    }
  }

  // Manejo de Umbral Stock Mínimo (Criterio 2)
  function abrirModalUmbral(prod: ProductoInventario) {
    setProductoAEditarUmbral(prod);
    setNuevoStockMinimo(prod.stock_minimo.toString());
    setErrorUmbral(null);
  }

  async function ejecutarGuardarUmbral(e: React.FormEvent) {
    e.preventDefault();
    if (!productoAEditarUmbral) return;

    const umbralNum = parseInt(nuevoStockMinimo, 10);
    if (isNaN(umbralNum) || umbralNum < 0) {
      setErrorUmbral("El umbral de stock mínimo debe ser mayor o igual a 0.");
      return;
    }

    setGuardandoUmbral(true);
    setErrorUmbral(null);

    try {
      const respuesta = await fetch("/api/admin/inventario/umbral", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: productoAEditarUmbral.id_producto,
          stock_minimo: umbralNum,
        }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setErrorUmbral(datos.error ?? "No se pudo actualizar el umbral.");
        return;
      }

      setMensajeExito(datos.mensaje ?? "Umbral actualizado exitosamente.");
      setProductoAEditarUmbral(null);
      await cargarInventario();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setErrorUmbral("Error de conexión al actualizar el umbral.");
    } finally {
      setGuardandoUmbral(false);
    }
  }

  const totalUrgentes = resumen.total_agotados + resumen.total_criticos;

  return (
    <div className="space-y-6">
      {/* Alerta de notificación temporal */}
      {mensajeExito && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span>{mensajeExito}</span>
          </div>
          <button
            onClick={() => setMensajeExito(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Criterio 3: KPIs y Alertas visuales destacadas de inventario */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Productos Agotados (Stock = 0) */}
        <div
          onClick={() => setPestanaFiltro("urgentes")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-sm ${
            resumen.total_agotados > 0
              ? "border-red-300 bg-red-50/70 hover:bg-red-50"
              : "border-zinc-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Agotados (Stock 0)
            </span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              Urgencia Máxima
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-red-900">{resumen.total_agotados}</p>
          <p className="mt-1 text-xs text-red-600">Artículos sin existencias para vender</p>
        </div>

        {/* KPI 2: Stock Crítico (Stock <= Stock Mínimo) */}
        <div
          onClick={() => setPestanaFiltro("urgentes")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-sm ${
            resumen.total_criticos > 0
              ? "border-amber-300 bg-amber-50/70 hover:bg-amber-50"
              : "border-zinc-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Stock Crítico
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              ≤ Umbral Mínimo
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-900">{resumen.total_criticos}</p>
          <p className="mt-1 text-xs text-amber-700">Próximos a agotarse, requieren reposición</p>
        </div>

        {/* KPI 3: Stock Óptimo / Normal */}
        <div
          onClick={() => setPestanaFiltro("todos")}
          className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Stock Adecuado
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Nivel Saludable
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-zinc-900">{resumen.total_normales}</p>
          <p className="mt-1 text-xs text-zinc-500">Superan su umbral de reserva</p>
        </div>

        {/* KPI 4: Total de unidades físicas */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Unidades
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {resumen.total_productos} productos
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-zinc-900">
            {resumen.total_unidades.toLocaleString("es-CO")}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Existencias físicas globales en catálogo</p>
        </div>
      </section>

      {/* Barra de Filtros y Navegación Rápida */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Criterio 4: Pestañas rápidas */}
          <div className="inline-flex rounded-xl bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => setPestanaFiltro("todos")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                pestanaFiltro === "todos"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Todos los productos ({productos.length})
            </button>
            <button
              type="button"
              onClick={() => setPestanaFiltro("urgentes")}
              className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                pestanaFiltro === "urgentes"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-red-700 hover:bg-red-50"
              }`}
            >
              <span>🚨 Reposición urgente</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  pestanaFiltro === "urgentes"
                    ? "bg-white text-red-700"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {totalUrgentes}
              </span>
            </button>
          </div>

          {/* Buscador y filtro por categoría */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
            >
              <option value="Todos">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={cargarInventario}
              disabled={cargando}
              title="Refrescar lista"
              className="rounded-lg border border-zinc-300 p-1.5 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Criterio 4: Banner informativo cuando se visualiza el filtro de reposición urgente */}
        {pestanaFiltro === "urgentes" && (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                Mostrando únicamente artículos con <strong>stock en cero</strong> o que se encuentran{" "}
                <strong>en o por debajo de su umbral mínimo configurado</strong>.
              </span>
            </div>
            <button
              onClick={() => setPestanaFiltro("todos")}
              className="underline font-semibold hover:text-red-950"
            >
              Ver todos
            </button>
          </div>
        )}
      </section>

      {/* Tabla de Productos de Inventario */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-medium text-zinc-900">Control de Existencias y Alertas</h2>
            <p className="text-xs text-zinc-500">
              Supervise los niveles de stock, modifique los umbrales mínimos y sume lotes de reposición.
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {productosFiltrados.length} {productosFiltrados.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>

        {cargando ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent mb-2"></div>
            <p>Cargando existencias de inventario...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-zinc-700">No se encontraron artículos.</p>
            <p className="mt-1 text-xs text-zinc-400">
              {pestanaFiltro === "urgentes"
                ? "¡Excelente noticia! No hay productos en nivel crítico ni agotados actualmente."
                : "Intenta ajustando el filtro de búsqueda o categoría."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 pr-4">Producto</th>
                  <th className="py-3 pr-4">Categoría</th>
                  <th className="py-3 pr-4">Precio</th>
                  <th className="py-3 pr-4 text-center">Stock Actual</th>
                  <th className="py-3 pr-4 text-center">Stock Mínimo</th>
                  <th className="py-3 pr-4">Alerta / Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {productosFiltrados.map((prod) => {
                  const esAgotado = prod.estado_stock === "AGOTADO";
                  const esCritico = prod.estado_stock === "CRITICO";

                  return (
                    <tr
                      key={prod.id_producto}
                      className={`transition-colors hover:bg-zinc-50/80 ${
                        esAgotado
                          ? "bg-red-50/40"
                          : esCritico
                          ? "bg-amber-50/30"
                          : ""
                      }`}
                    >
                      {/* Producto */}
                      <td className="py-3 pr-4">
                        <div className="font-medium text-zinc-900 flex items-center gap-2">
                          {prod.imagen_url && (
                            <span className="text-lg">{prod.imagen_url}</span>
                          )}
                          <span>{prod.nombre}</span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          {prod.codigo_barras ?? `ID-${prod.id_producto}`}
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3 pr-4 text-xs text-zinc-600">
                        <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 font-medium">
                          {prod.categoria}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="py-3 pr-4 text-xs font-medium text-zinc-700">
                        {formatearPrecio(prod.precio)}
                      </td>

                      {/* Stock Actual */}
                      <td className="py-3 pr-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-lg text-sm font-bold ${
                            esAgotado
                              ? "bg-red-600 text-white"
                              : esCritico
                              ? "bg-amber-500 text-white"
                              : "bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          {prod.cantidad_stock}
                        </span>
                      </td>

                      {/* Criterio 2: Stock Mínimo con botón para editar */}
                      <td className="py-3 pr-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-zinc-700">
                            {prod.stock_minimo}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalUmbral(prod)}
                            title="Ajustar umbral de stock mínimo"
                            className="text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 p-1 rounded transition"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>

                      {/* Criterio 3: Alertas visuales destacadas */}
                      <td className="py-3 pr-4">
                        {esAgotado ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-300 px-2.5 py-1 text-xs font-bold text-red-800 animate-pulse">
                            <span>⛔</span>
                            <span>Agotado</span>
                          </span>
                        ) : esCritico ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-1 text-xs font-bold text-amber-900">
                            <span>⚠️</span>
                            <span>Stock Crítico ({prod.cantidad_stock} ≤ {prod.stock_minimo})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-800">
                            <span>✓</span>
                            <span>Óptimo</span>
                          </span>
                        )}
                      </td>

                      {/* Criterio 1: Opción de Reposición */}
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => abrirModalReposicion(prod)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
                            esAgotado
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-300 ring-offset-1"
                              : esCritico
                              ? "bg-amber-600 text-white hover:bg-amber-700"
                              : "bg-zinc-900 text-white hover:bg-zinc-800"
                          }`}
                        >
                          + Reponer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL 1: Reposición de Stock (Criterios 1 y 5) */}
      {productoAReponer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Ingresar Reposición de Stock</h3>
                <p className="text-xs text-zinc-500">Suma nuevas unidades al inventario disponible</p>
              </div>
              <button
                type="button"
                onClick={() => setProductoAReponer(null)}
                className="text-zinc-400 hover:text-zinc-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Detalle del producto a reponer */}
            <div className="mt-4 rounded-xl bg-zinc-50 p-3 border border-zinc-200 space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Producto</p>
              <p className="font-semibold text-zinc-900 text-sm">{productoAReponer.nombre}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-600 pt-1">
                <span>
                  Stock actual: <strong>{productoAReponer.cantidad_stock}</strong> uds
                </span>
                <span>•</span>
                <span>
                  Umbral mínimo: <strong>{productoAReponer.stock_minimo}</strong> uds
                </span>
              </div>
            </div>

            <form onSubmit={ejecutarReposicion} className="mt-4 space-y-4">
              <div>
                <label htmlFor="cantidadReposicion" className="block text-xs font-semibold text-zinc-700">
                  Cantidad a reponer (unidades a sumar) *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="cantidadReposicion"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={cantidadReposicion}
                    onChange={(e) => setCantidadReposicion(e.target.value)}
                    onKeyDown={(e) => {
                      // Criterio 5: prevenir signos negativos en la pulsación de teclas
                      if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Ej. 15"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-base font-semibold text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-medium">
                    unidades
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Solo se permiten números enteros positivos mayores a cero.
                </p>
              </div>

              {/* Vista previa del stock resultante */}
              {(() => {
                const add = parseInt(cantidadReposicion, 10);
                if (!isNaN(add) && add > 0) {
                  const totalFuturo = productoAReponer.cantidad_stock + add;
                  return (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900 flex items-center justify-between">
                      <span>Nuevo stock resultante:</span>
                      <span className="font-bold text-sm">
                        {productoAReponer.cantidad_stock} + {add} = {totalFuturo} uds
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {errorReposicion && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                  ⚠️ {errorReposicion}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductoAReponer(null)}
                  disabled={guardandoReposicion}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoReposicion}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {guardandoReposicion ? "Ingresando lote..." : "Confirmar Reposición"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Configuración de Umbral Stock Mínimo (Criterio 2) */}
      {productoAEditarUmbral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Configurar Umbral Mínimo</h3>
                <p className="text-xs text-zinc-500">
                  Establece a partir de qué cantidad se activa la alerta de Stock Crítico
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductoAEditarUmbral(null)}
                className="text-zinc-400 hover:text-zinc-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-zinc-50 p-3 border border-zinc-200">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Producto</p>
              <p className="font-semibold text-zinc-900 text-sm">{productoAEditarUmbral.nombre}</p>
              <p className="text-xs text-zinc-600 mt-1">
                Stock físico actual: <strong>{productoAEditarUmbral.cantidad_stock}</strong> unidades
              </p>
            </div>

            <form onSubmit={ejecutarGuardarUmbral} className="mt-4 space-y-4">
              <div>
                <label htmlFor="nuevoStockMinimo" className="block text-xs font-semibold text-zinc-700">
                  Stock Mínimo Deseado (Default 5) *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="nuevoStockMinimo"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={nuevoStockMinimo}
                    onChange={(e) => setNuevoStockMinimo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") {
                        e.preventDefault();
                      }
                    }}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-base font-semibold text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-medium">
                    unidades
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Cuando las existencias sean menores o iguales a este valor, se marcará como Stock Crítico.
                </p>
              </div>

              {errorUmbral && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                  ⚠️ {errorUmbral}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductoAEditarUmbral(null)}
                  disabled={guardandoUmbral}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoUmbral}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {guardandoUmbral ? "Guardando..." : "Guardar Umbral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
