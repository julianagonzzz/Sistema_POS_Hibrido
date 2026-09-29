"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VendedorInfo, ClienteRegistrado } from "@/lib/vendedores";
import { Producto } from "@/lib/productos";
import { MedioPago, VentaCompleta, ResumenVentaFila } from "@/lib/ventas";

interface Props {
  vendedor: VendedorInfo;
  productosIniciales: Producto[];
  clientesIniciales: ClienteRegistrado[];
}

interface ItemCarritoPOS {
  producto: Producto;
  cantidad: number;
}

function formatearCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function PanelSeller({
  vendedor,
  productosIniciales,
  clientesIniciales,
}: Props) {
  const router = useRouter();

  // Pestaña activa: "venta" (US_04), "clientes" (US_03 y consulta), "historial"
  const [pestana, setPestana] = useState<"venta" | "clientes" | "historial">("venta");

  // Estado del catálogo local para reflejar descuentos de stock en vivo
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todos");
  const [busquedaProducto, setBusquedaProducto] = useState<string>("");

  // Estado de clientes
  const [clientes, setClientes] = useState<ClienteRegistrado[]>(clientesIniciales);
  const [busquedaCliente, setBusquedaCliente] = useState<string>("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRegistrado | null>(null);

  // Formulario de registro de nuevo cliente (US_03)
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevaCedula, setNuevaCedula] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [registrandoCliente, setRegistrandoCliente] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  const [exitoRegistro, setExitoRegistro] = useState<{
    mensaje: string;
    contrasena: string;
    cliente: ClienteRegistrado;
  } | null>(null);

  // Carrito de venta (US_04)
  const [carrito, setCarrito] = useState<ItemCarritoPOS[]>([]);
  const [medioPago, setMedioPago] = useState<MedioPago>("EFECTIVO");
    // US_14: datos del pago según la modalidad
  const [montoRecibido, setMontoRecibido] = useState<string>(""); // solo EFECTIVO
  const [referenciaPago, setReferenciaPago] = useState<string>(""); // opcional en electrónicos
  const [pagoConfirmado, setPagoConfirmado] = useState(false); // aprobación datáfono/Nequi/transf.
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  const [errorVenta, setErrorVenta] = useState<string | null>(null);
  const [reciboVenta, setReciboVenta] = useState<VentaCompleta | null>(null);

  // Historial de ventas
  const [historialVentas, setHistorialVentas] = useState<ResumenVentaFila[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Categorías de productos
  const categorias = useMemo(() => {
    const cats = Array.from(new Set(productos.map((p) => p.categoria)));
    return ["Todos", ...cats];
  }, [productos]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchCat = filtroCategoria === "Todos" || p.categoria === filtroCategoria;
      const matchSearch =
        busquedaProducto.trim() === "" ||
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(busquedaProducto.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [productos, filtroCategoria, busquedaProducto]);

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente.trim()) return clientes;
    const q = busquedaCliente.toLowerCase();
    return clientes.filter(
      (c) =>
        c.correo.toLowerCase().includes(q) ||
        c.cedula.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q)
    );
  }, [clientes, busquedaCliente]);

  // Totales de la venta
  const subtotal = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  }, [carrito]);
  const impuesto = 0;
  const total = subtotal + impuesto;
  
  // US_14: cálculo del cambio y validación del pago
  const esEfectivo = medioPago === "EFECTIVO";
  const montoRecibidoNum = Number(montoRecibido.replace(/\D/g, "")) || 0;
  const cambio = esEfectivo ? montoRecibidoNum - Math.round(total) : 0;
  const efectivoInsuficiente = esEfectivo && montoRecibidoNum < Math.round(total);
  const pagoValido = esEfectivo ? !efectivoInsuficiente && montoRecibidoNum > 0 : pagoConfirmado;

  // Billetes sugeridos para cobro rápido: valor exacto y redondeos hacia arriba
  const sugerenciasEfectivo = useMemo(() => {
    const t = Math.round(total);
    if (t <= 0) return [];
    const opciones = new Set<number>([t]);
    for (const base of [10000, 20000, 50000, 100000]) {
      opciones.add(Math.ceil(t / base) * base);
    }
    return [...opciones].sort((a, b) => a - b).slice(0, 4);
  }, [total]);

  function cambiarMedioPago(mp: MedioPago) {
    setMedioPago(mp);
    setMontoRecibido("");
    setReferenciaPago("");
    setPagoConfirmado(false);
    setErrorVenta(null);
  }

  // Acciones del carrito
  function agregarAlCarrito(producto: Producto) {
    if (producto.cantidad_stock <= 0) return;

    setCarrito((prev) => {
      const index = prev.findIndex((it) => it.producto.id_producto === producto.id_producto);
      if (index >= 0) {
        const itemExistente = prev[index];
        if (itemExistente.cantidad >= producto.cantidad_stock) {
          alert(`No puedes agregar más unidades. Stock disponible: ${producto.cantidad_stock}`);
          return prev;
        }
        const copia = [...prev];
        copia[index] = { ...itemExistente, cantidad: itemExistente.cantidad + 1 };
        return copia;
      } else {
        return [...prev, { producto, cantidad: 1 }];
      }
    });
  }

  function modificarCantidad(id_producto: number, delta: number) {
    setCarrito((prev) => {
      return prev
        .map((it) => {
          if (it.producto.id_producto === id_producto) {
            const nuevaCantidad = it.cantidad + delta;
            if (nuevaCantidad > it.producto.cantidad_stock) {
              alert(`Stock máximo alcanzado (${it.producto.cantidad_stock} uds)`);
              return it;
            }
            return { ...it, cantidad: nuevaCantidad };
          }
          return it;
        })
        .filter((it) => it.cantidad > 0);
    });
  }

  function removerDelCarrito(id_producto: number) {
    setCarrito((prev) => prev.filter((it) => it.producto.id_producto !== id_producto));
  }

  // Manejar Registro de Nuevo Cliente (US_03)
  async function manejarRegistroCliente(e: React.FormEvent) {
    e.preventDefault();
    setErrorRegistro(null);
    setExitoRegistro(null);
    setRegistrandoCliente(true);

    try {
      const res = await fetch("/api/seller/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoNombre,
          correo: nuevoCorreo,
          cedula: nuevaCedula,
          telefono: nuevoTelefono,
          direccion: nuevaDireccion,
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setErrorRegistro(datos.error || "No se pudo registrar el cliente.");
        return;
      }

      setExitoRegistro({
        mensaje: datos.mensaje,
        contrasena: datos.contrasenaAsignada,
        cliente: datos.cliente,
      });

      // Agregar a la lista de clientes disponibles y seleccionarlo automáticamente
      setClientes((prev) => [datos.cliente, ...prev]);
      setClienteSeleccionado(datos.cliente);

      // Limpiar formulario
      setNuevoNombre("");
      setNuevoCorreo("");
      setNuevaCedula("");
      setNuevoTelefono("");
      setNuevaDireccion("");
    } catch {
      setErrorRegistro("Error de conexión al registrar cliente.");
    } finally {
      setRegistrandoCliente(false);
    }
  }

  // Manejar Crear Venta (US_04)
  async function procesarCreacionVenta() {
    if (!clienteSeleccionado) {
      setErrorVenta("Por favor selecciona o busca un cliente antes de registrar la venta.");
      return;
    }

    if (carrito.length === 0) {
      setErrorVenta("El carrito está vacío. Agrega al menos un producto.");
      return;
    }

    if (esEfectivo && efectivoInsuficiente) {
      setErrorVenta("El efectivo recibido es menor al total a pagar.");
      return;
    }

    if (!esEfectivo && !pagoConfirmado) {
      setErrorVenta("Confirma que la transacción fue aprobada antes de registrar la venta.");
      return;
    }

    setErrorVenta(null);
    setProcesandoVenta(true);

    try {
      const res = await fetch("/api/seller/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: clienteSeleccionado.id_usuario,
          medio_pago: medioPago,
          monto_recibido: esEfectivo ? montoRecibidoNum : null,
          referencia_pago: esEfectivo ? null : referenciaPago.trim() || null,
          items: carrito.map((item) => ({
            id_producto: item.producto.id_producto,
            cantidad: item.cantidad,
          })),
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setErrorVenta(datos.error || "No se pudo procesar la venta.");
        return;
      }

      // Venta exitosa: actualizar stock en memoria local
      setProductos((prev) =>
        prev.map((p) => {
          const itemVendido = carrito.find((c) => c.producto.id_producto === p.id_producto);
          if (itemVendido) {
            return { ...p, cantidad_stock: p.cantidad_stock - itemVendido.cantidad };
          }
          return p;
        })
      );

      // Mostrar recibo y vaciar carrito
      setReciboVenta(datos.venta);
      setCarrito([]);
      setMontoRecibido("");
      setReferenciaPago("");
      setPagoConfirmado(false);
    } catch {
      setErrorVenta("Error de conexión al procesar la venta.");
    } finally {
      setProcesandoVenta(false);
    }
  }

  // Cargar historial de ventas
  async function cargarHistorial() {
    setCargandoHistorial(true);
    try {
      const res = await fetch("/api/seller/ventas");
      const datos = await res.json();
      if (res.ok && datos.ventas) {
        setHistorialVentas(datos.ventas);
      }
    } catch {
      console.error("Error al cargar historial.");
    } finally {
      setCargandoHistorial(false);
    }
  }

  // Cerrar sesión
  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Barra de cabecera superior */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg shadow-xs">
              POS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">HíbridoPOS</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Panel Vendedor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Punto de Venta / Caja: <strong className="text-white">{vendedor.codigo_caja}</strong> • Turno:{" "}
                <strong className="text-white">{vendedor.turno}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right text-xs">
              <span className="text-slate-400 block">Vendedor en turno</span>
              <span className="font-semibold text-white">{vendedor.nombre}</span>
            </div>

            <button
              onClick={cerrarSesion}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="bg-slate-800 border-t border-slate-700/60 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex gap-2">
            <button
              onClick={() => setPestana("venta")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                pestana === "venta"
                  ? "border-emerald-400 text-emerald-400 bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span>🛒</span>
              <span>Crear Venta / POS</span>
              {carrito.length > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-xs px-2 py-0.2 rounded-full font-extrabold">
                  {carrito.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setPestana("clientes")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                pestana === "clientes"
                  ? "border-emerald-400 text-emerald-400 bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span>👤</span>
              <span>Información y Clientes</span>
            </button>

            <button
              onClick={() => {
                setPestana("historial");
                cargarHistorial();
              }}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                pestana === "historial"
                  ? "border-emerald-400 text-emerald-400 bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span>📜</span>
              <span>Historial de Caja</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido según la pestaña */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ================================================================= */}
        {/* PESTAÑA 1: CREAR COMPRA / POS (US_04)                              */}
        {/* ================================================================= */}
        {pestana === "venta" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna Izquierda: Catálogo y selección de productos (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Barra de Filtros y Búsqueda de Productos */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar producto por nombre o código de barras..."
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFiltroCategoria(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        filtroCategoria === cat
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Productos Disponibles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {productosFiltrados.map((prod) => {
                  const enCarrito = carrito.find((it) => it.producto.id_producto === prod.id_producto);
                  const agotado = prod.cantidad_stock <= 0;

                  return (
                    <div
                      key={prod.id_producto}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-3xl">{prod.imagen_url || "🛍️"}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              agotado
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            Stock: {prod.cantidad_stock}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2">
                          {prod.categoria}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{prod.nombre}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{prod.descripcion}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-base font-extrabold text-slate-900">
                          {formatearCOP(prod.precio)}
                        </span>

                        <button
                          onClick={() => agregarAlCarrito(prod)}
                          disabled={agotado}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            agotado
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : enCarrito
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          {enCarrito ? `+ Añadir (${enCarrito.cantidad})` : "+ Agregar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Cliente y Carrito de Venta (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Sección 1: Identificación del Cliente (Criterio 1 y 2 de US_04) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <h3 className="font-bold text-slate-900 text-sm">Cliente de la Venta</h3>
                  </div>
                  <button
                    onClick={() => setPestana("clientes")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    + Registrar nuevo cliente
                  </button>
                </div>

                {clienteSeleccionado ? (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Cliente Seleccionado
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{clienteSeleccionado.nombre}</h4>
                      <p className="text-xs text-slate-600">
                        Cédula: <strong>{clienteSeleccionado.cedula}</strong>
                      </p>
                      <p className="text-xs text-slate-500">{clienteSeleccionado.correo}</p>
                      {clienteSeleccionado.punto_venta && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Punto de registro: {clienteSeleccionado.punto_venta}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setClienteSeleccionado(null)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Buscar por correo o cédula del cliente..."
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />

                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                      {clientesFiltrados.slice(0, 5).map((cl) => (
                        <button
                          key={cl.id_usuario}
                          onClick={() => {
                            setClienteSeleccionado(cl);
                            setBusquedaCliente("");
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{cl.nombre}</span>
                            <span className="text-slate-500 text-[11px]">
                              CC: {cl.cedula} • {cl.correo}
                            </span>
                          </div>
                          <span className="text-emerald-600 font-semibold">Seleccionar →</span>
                        </button>
                      ))}
                      {clientesFiltrados.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No se encontraron clientes con ese criterio.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 2: Ticket / Carrito de Venta */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>🧾</span>
                    <span>Ticket de Compra</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {carrito.reduce((acc, it) => acc + it.cantidad, 0)} unidades
                  </span>
                </div>

                {carrito.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    El carrito está vacío. Agrega productos desde el catálogo a la izquierda.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
                    {carrito.map((item) => (
                      <div key={item.producto.id_producto} className="pt-2.5 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-800 text-xs line-clamp-1">
                            {item.producto.nombre}
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            {formatearCOP(item.producto.precio)} c/u
                          </span>
                        </div>

                        {/* Selector de cantidad */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => modificarCantidad(item.producto.id_producto, -1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.cantidad}</span>
                          <button
                            onClick={() => modificarCantidad(item.producto.id_producto, 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="font-bold text-slate-900 text-xs block">
                            {formatearCOP(item.producto.precio * item.cantidad)}
                          </span>
                          <button
                            onClick={() => removerDelCarrito(item.producto.id_producto)}
                            className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Medio de Pago */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Medio de Pago:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["EFECTIVO", "DATAFONO", "NEQUI", "TRANSFERENCIA"] as MedioPago[]).map((mp) => (
                      <button
                        key={mp}
                        type="button"
                        onClick={() => cambiarMedioPago(mp)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          medioPago === mp
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {mp === "EFECTIVO" && "💵 Efectivo"}
                        {mp === "DATAFONO" && "💳 Datáfono"}
                        {mp === "NEQUI" && "📱 Nequi"}
                        {mp === "TRANSFERENCIA" && "🏦 Transf."}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumen de totales */}
                <div className="pt-4 border-t border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatearCOP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>IVA</span>
                    <span>Incluido en el precio</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-950 pt-2 border-t border-slate-100">
                    <span>TOTAL A COBRAR</span>
                    <span className="text-emerald-600 text-lg">{formatearCOP(total)}</span>
                  </div>
                </div>

                {/* Detalle del pago según modalidad (US_14) */}
                {carrito.length > 0 && esEfectivo && (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <label htmlFor="monto-recibido" className="text-xs font-bold text-slate-700 block">
                      Efectivo recibido
                    </label>
                    <input
                      id="monto-recibido"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 50000"
                      value={montoRecibido ? Number(montoRecibido).toLocaleString("es-CO") : ""}
                      onChange={(e) => setMontoRecibido(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {sugerenciasEfectivo.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setMontoRecibido(String(v))}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer"
                        >
                          {v === Math.round(total) ? "Exacto" : formatearCOP(v)}
                        </button>
                      ))}
                    </div>
                    {montoRecibido !== "" && (
                      efectivoInsuficiente ? (
                        <p className="text-xs font-semibold text-rose-600">
                          Faltan {formatearCOP(Math.round(total) - montoRecibidoNum)}
                        </p>
                      ) : (
                        <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
                          <span>CAMBIO A DEVOLVER</span>
                          <span className="text-emerald-600 text-lg">{formatearCOP(cambio)}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                {carrito.length > 0 && !esEfectivo && (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <p className="text-xs text-slate-600">
                      {medioPago === "DATAFONO" && "Digita en el datáfono el monto exacto:"}
                      {medioPago === "NEQUI" && "Solicita al cliente enviar por Nequi el monto exacto:"}
                      {medioPago === "TRANSFERENCIA" && "Solicita al cliente transferir el monto exacto:"}
                    </p>
                    <p className="text-xl font-extrabold text-slate-900 text-center">{formatearCOP(total)}</p>
                    <label htmlFor="referencia-pago" className="text-xs font-bold text-slate-700 block">
                      N.º de aprobación / referencia <span className="font-normal text-slate-400">(opcional)</span>
                    </label>
                    <input
                      id="referencia-pago"
                      type="text"
                      maxLength={60}
                      placeholder={medioPago === "DATAFONO" ? "Ej: 004512" : "Ej: M1234567"}
                      value={referenciaPago}
                      onChange={(e) => setReferenciaPago(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pagoConfirmado}
                        onChange={(e) => setPagoConfirmado(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      Transacción aprobada
                    </label>
                  </div>
                )}

                {errorVenta && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    ⚠️ {errorVenta}
                  </div>
                )}

                <button
                  onClick={procesarCreacionVenta}
                  disabled={procesandoVenta || carrito.length === 0 || !clienteSeleccionado || !pagoValido}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    procesandoVenta || carrito.length === 0 || !clienteSeleccionado || !pagoValido                    
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
                  }`}
                >
                  {procesandoVenta ? "Procesando venta..." : "✓ Finalizar y Registrar Venta"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 2: INFORMACIÓN Y REGISTRO DE CLIENTES (US_03)             */}
        {/* ================================================================= */}
        {pestana === "clientes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulario de registro de cliente (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Registro de Nuevo Cliente
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  El cliente quedará asociado automáticamente a tu punto de venta (Caja{" "}
                  <strong>{vendedor.codigo_caja}</strong>).
                </p>
              </div>

              {exitoRegistro && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
                  <p className="font-bold text-emerald-800">🎉 {exitoRegistro.mensaje}</p>
                  <p>
                    Cliente: <strong>{exitoRegistro.cliente.nombre}</strong> (CC:{" "}
                    {exitoRegistro.cliente.cedula})
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-300">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Acceso a Tienda Virtual:
                    </span>
                    <p className="font-mono text-xs">
                      Usuario: <strong>{exitoRegistro.cliente.correo}</strong>
                    </p>
                    <p className="font-mono text-xs">
                      Contraseña temporal: <strong>{exitoRegistro.contrasena}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setClienteSeleccionado(exitoRegistro.cliente);
                      setPestana("venta");
                    }}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    Crear Venta para este Cliente →
                  </button>
                </div>
              )}

              {errorRegistro && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  ⚠️ {errorRegistro}
                </div>
              )}

              <form onSubmit={manejarRegistroCliente} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Pérez"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico * (Identificador Virtual)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@correo.com"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cédula / Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 1098765432"
                    value={nuevaCedula}
                    onChange={(e) => setNuevaCedula(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="3001234567"
                      value={nuevoTelefono}
                      onChange={(e) => setNuevoTelefono(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Punto Venta</label>
                    <input
                      type="text"
                      disabled
                      value={`Caja ${vendedor.codigo_caja}`}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    placeholder="Calle 10 # 5-20"
                    value={nuevaDireccion}
                    onChange={(e) => setNuevaDireccion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={registrandoCliente}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  {registrandoCliente ? "Guardando cliente..." : "+ Registrar Cliente"}
                </button>
              </form>
            </div>

            {/* Listado y Consulta de Clientes (7 cols) (US_04) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Clientes Registrados</h3>
                  <p className="text-xs text-slate-500">
                    Consulta información de clientes y selecciona para vender.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                  {clientesFiltrados.length} clientes encontrados
                </div>
              </div>

              <input
                type="text"
                placeholder="Filtrar por nombre, correo o cédula..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto border border-slate-100 rounded-xl">
                {clientesFiltrados.map((cl) => (
                  <div
                    key={cl.id_usuario}
                    className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cl.nombre}</h4>
                      <p className="text-xs text-slate-600">
                        Cédula: <strong>{cl.cedula}</strong> • Correo: {cl.correo}
                      </p>
                      <div className="flex gap-2 text-[11px] text-slate-400 mt-1">
                        {cl.telefono && <span>📞 {cl.telefono}</span>}
                        {cl.punto_venta && <span>🏪 Caja: {cl.punto_venta}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setClienteSeleccionado(cl);
                        setPestana("venta");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Crear Compra →
                    </button>
                  </div>
                ))}

                {clientesFiltrados.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron clientes registrados.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 3: HISTORIAL DE VENTAS DE LA CAJA                         */}
        {/* ================================================================= */}
        {pestana === "historial" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Historial de Ventas</h3>
                <p className="text-xs text-slate-500">
                  Ventas registradas en la <strong>Caja {vendedor.codigo_caja}</strong> por{" "}
                  <strong>{vendedor.nombre}</strong>.
                </p>
              </div>

              <button
                onClick={cargarHistorial}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                🔄 Actualizar
              </button>
            </div>

            {cargandoHistorial ? (
              <div className="p-8 text-center text-xs text-slate-500">Cargando ventas...</div>
            ) : historialVentas.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay ventas registradas aún en este turno.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3"># Venta</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Medio de Pago</th>
                      <th className="p-3">Items</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historialVentas.map((v) => (
                      <tr key={v.id_venta} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-700">#{v.id_venta}</td>
                        <td className="p-3 text-slate-500">
                          {new Date(v.fecha).toLocaleString("es-CO")}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">
                            {v.cliente_nombre}
                          </span>
                          <span className="text-[11px] text-slate-400">CC: {v.cliente_cedula}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700 text-[10px]">
                            {v.medio_pago}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{v.cantidad_items} productos</td>
                        <td className="p-3 text-right font-extrabold text-slate-900">
                          {formatearCOP(Number(v.total))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* MODAL DE COMPROBANTE / RECIBO DE VENTA EXITOSA                     */}
      {/* ================================================================= */}
      {reciboVenta && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Cabecera del modal (visible en pantalla, oculta en impresión) */}
            <div className="text-center space-y-1 print:hidden">
              <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 text-xl font-bold flex items-center justify-center mx-auto mb-1">
                ✓
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">Venta Completada</h3>
            </div>

            {/* Recibo térmico / comprobante limpio */}
            <div
              id="comprobante-impresion"
              className="p-5 bg-amber-50/40 font-mono text-xs text-slate-800 rounded-xl border border-dashed border-slate-300 space-y-3 shadow-inner"
            >
              {/* Encabezado del ticket */}
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
                <p className="font-extrabold text-sm tracking-wider uppercase">Sistema POS Híbrido</p>
                <p className="text-[10px] text-slate-500">Punto de Venta Oficial</p>
                <div className="text-[10px] text-slate-600 pt-1 flex justify-between">
                  <span>Ticket: #{String(reciboVenta.id_venta).padStart(6, "0")}</span>
                  <span>Caja: {reciboVenta.codigo_caja}</span>
                </div>
                <div className="text-[10px] text-slate-500 text-left">
                  <span>Fecha: {new Date(reciboVenta.fecha).toLocaleString("es-CO")}</span>
                </div>
              </div>

              {/* Datos del Cliente y Vendedor */}
              <div className="border-b border-dashed border-slate-300 pb-2 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-bold truncate max-w-[170px]">{reciboVenta.cliente_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">C.C. / NIT:</span>
                  <span>{reciboVenta.cliente_cedula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cajero:</span>
                  <span>{reciboVenta.vendedor_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pago:</span>
                  <span className="font-semibold">{reciboVenta.medio_pago}</span>
                </div>
              </div>

              {/* Detalle de Productos */}
              <div className="border-b border-dashed border-slate-300 pb-2 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>Cant. Descripción</span>
                  <span>Total</span>
                </div>
                {reciboVenta.detalles.map((d) => (
                  <div key={d.id_detalle} className="text-[11px] leading-tight">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900 truncate max-w-[190px]">
                        {d.cantidad}x {d.nombre}
                      </span>
                      <span className="font-bold">{formatearCOP(d.subtotal)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-4">
                      {d.cantidad} x {formatearCOP(d.precio_unitario)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatearCOP(reciboVenta.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA:</span>
                  <span>Incluido</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-1 border-t border-slate-300">
                  <span>TOTAL PAGADO:</span>
                  <span>{formatearCOP(reciboVenta.total)}</span>
                </div>
                                {/* Desglose del pago (US_14) */}
                <div className="flex justify-between text-slate-600">
                  <span>{reciboVenta.medio_pago === "EFECTIVO" ? "Efectivo recibido:" : "Monto cobrado:"}</span>
                  <span>{formatearCOP(Number(reciboVenta.monto_recibido))}</span>
                </div>
                {reciboVenta.medio_pago === "EFECTIVO" && (
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Cambio:</span>
                    <span>{formatearCOP(Number(reciboVenta.cambio))}</span>
                  </div>
                )}
                {reciboVenta.referencia_pago && (
                  <div className="flex justify-between text-slate-600">
                    <span>Ref. aprobación:</span>
                    <span>{reciboVenta.referencia_pago}</span>
                  </div>
                )}
              </div>

              {/* Mensaje de pie de ticket */}
              <div className="text-center pt-2 text-[10px] text-slate-400 space-y-0.5 border-t border-dashed border-slate-300">
                <p>¡Gracias por su compra!</p>
                <p>Conserve este tiquet para cualquier reclamo</p>
              </div>
            </div>

            {/* Acciones (ocultas en la impresión) */}
            <div className="flex gap-2 print:hidden pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setReciboVenta(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
