"use client";

// US_10 - Proceso de Checkout y Confirmación de Pedido Online

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useCarrito } from "../carrito/CarritoContext";
import {
  MedioPagoOnline,
  PerfilEnvioCliente,
  VentaOnlineConfirmada,
} from "@/lib/checkout";

function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const CIUDADES_PRINCIPALES = [
  "Bogotá D.C.",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Santa Marta",
  "Ibagué",
  "Cúcuta",
  "Villavicencio",
  "Pasto",
  "Armenia",
  "Otra ciudad",
];

const BANCOS_PSE = [
  "Bancolombia",
  "Davivienda",
  "Banco de Bogotá",
  "BBVA Colombia",
  "Nequi",
  "Scotiabank Colpatria",
  "Banco de Occidente",
  "Banco Popular",
  "Dale!",
  "Banco AV Villas",
  "Lulo Bank",
  "Nu Colombia",
];

export default function CheckoutPage() {
  const { items, total, cantidadTotal, cargado, vaciar } = useCarrito();

  // Estado de autenticación y perfil del cliente
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [perfil, setPerfil] = useState<PerfilEnvioCliente | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Formulario: Datos de Entrega (CA1)
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState(CIUDADES_PRINCIPALES[0]);
  const [otraCiudad, setOtraCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [guardarDatosEnvio, setGuardarDatosEnvio] = useState(true);

  // Formulario: Modalidad de Pago Virtual (CA2)
  const [medioPago, setMedioPago] = useState<MedioPagoOnline>("TARJETA_CREDITO");

  // Datos específicos: Tarjeta de Crédito
  const [tarjetaNumero, setTarjetaNumero] = useState("");
  const [tarjetaNombre, setTarjetaNombre] = useState("");
  const [tarjetaVencimiento, setTarjetaVencimiento] = useState("");
  const [tarjetaCvv, setTarjetaCvv] = useState("");
  const [tarjetaCuotas, setTarjetaCuotas] = useState("1");

  // Datos específicos: PSE
  const [pseBanco, setPseBanco] = useState(BANCOS_PSE[0]);
  const [pseTipoPersona, setPseTipoPersona] = useState<"NATURAL" | "JURIDICA">("NATURAL");
  const [pseCorreo, setPseCorreo] = useState("");

  // Datos específicos: Transferencia
  const [transferenciaComprobante, setTransferenciaComprobante] = useState("");

  // Estado de procesamiento y confirmación (CA6)
  const [procesando, setProcesando] = useState(false);
  const [errorProceso, setErrorProceso] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<VentaOnlineConfirmada | null>(null);

  // 1. Cargar perfil del cliente autenticado y precargar datos (CA1)
  useEffect(() => {
    async function cargarPerfil() {
      setCargandoPerfil(true);
      try {
        const respuesta = await fetch("/api/checkout/perfil");
        if (respuesta.status === 401) {
          setAutenticado(false);
          return;
        }
        const datos = await respuesta.json();
        if (respuesta.ok && datos.perfil) {
          setAutenticado(true);
          setPerfil(datos.perfil);

          // Precarga de datos si ya existen en la base de datos
          if (datos.perfil.direccion) setDireccion(datos.perfil.direccion);
          if (datos.perfil.telefono) setTelefono(datos.perfil.telefono);
          if (datos.perfil.nombre) setDestinatario(datos.perfil.nombre);
          if (datos.perfil.correo) setPseCorreo(datos.perfil.correo);

          if (datos.perfil.ciudad) {
            if (CIUDADES_PRINCIPALES.includes(datos.perfil.ciudad)) {
              setCiudad(datos.perfil.ciudad);
            } else {
              setCiudad("Otra ciudad");
              setOtraCiudad(datos.perfil.ciudad);
            }
          }
        } else {
          setAutenticado(false);
        }
      } catch {
        setAutenticado(false);
      } finally {
        setCargandoPerfil(false);
      }
    }
    cargarPerfil();
  }, []);

  const ciudadFinal = useMemo(() => {
    return ciudad === "Otra ciudad" ? otraCiudad.trim() : ciudad;
  }, [ciudad, otraCiudad]);

  // Manejar formato visual de número de tarjeta
  function formatearTarjeta(valor: string) {
    const soloNumeros = valor.replace(/\D/g, "").slice(0, 16);
    const grupos = soloNumeros.match(/.{1,4}/g);
    setTarjetaNumero(grupos ? grupos.join(" ") : soloNumeros);
  }

  // Manejar formato visual de MM/AA
  function formatearVencimiento(valor: string) {
    const soloNumeros = valor.replace(/\D/g, "").slice(0, 4);
    if (soloNumeros.length >= 3) {
      setTarjetaVencimiento(`${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`);
    } else {
      setTarjetaVencimiento(soloNumeros);
    }
  }

  // Confirmar y pagar la orden
  async function manejarCheckout(e: React.FormEvent) {
    e.preventDefault();
    setErrorProceso(null);

    if (!direccion.trim()) {
      setErrorProceso("Por favor ingresa la dirección de entrega.");
      return;
    }
    if (!ciudadFinal) {
      setErrorProceso("Por favor especifica la ciudad de entrega.");
      return;
    }
    if (!telefono.trim()) {
      setErrorProceso("Por favor ingresa un teléfono de contacto para el envío.");
      return;
    }
    if (items.length === 0) {
      setErrorProceso("No hay artículos en tu carrito de compras.");
      return;
    }

    setProcesando(true);

    try {
      const cuerpo = {
        direccion: direccion.trim(),
        ciudad: ciudadFinal,
        telefono: telefono.trim(),
        medio_pago: medioPago,
        guardar_datos_envio: guardarDatosEnvio,
        items: items.map((it) => ({
          id_producto: it.id_producto,
          cantidad: it.cantidad,
        })),
        detalles_pago: {
          tarjeta:
            medioPago === "TARJETA_CREDITO"
              ? {
                  numero: tarjetaNumero,
                  nombre_titular: tarjetaNombre,
                  vencimiento: tarjetaVencimiento,
                  cvv: tarjetaCvv,
                  cuotas: parseInt(tarjetaCuotas, 10) || 1,
                }
              : undefined,
          pse:
            medioPago === "PSE"
              ? {
                  banco: pseBanco,
                  tipo_persona: pseTipoPersona,
                  correo_pse: pseCorreo,
                }
              : undefined,
          transferencia:
            medioPago === "TRANSFERENCIA"
              ? {
                  referencia_comprobante: transferenciaComprobante,
                }
              : undefined,
        },
      };

      const respuesta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorProceso(datos.error ?? "No se pudo procesar el pago online.");
        return;
      }

      // Criterio 6: Vaciar el carrito de compras tras la transacción exitosa
      vaciar();

      // Mostrar pantalla de confirmación con el número de pedido y resumen
      setPedidoConfirmado(datos.venta);
    } catch {
      setErrorProceso("Error de conexión al procesar el pedido. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  }

  // PANTALLA DE CONFIRMACIÓN DE PEDIDO (CA6)
  if (pedidoConfirmado) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-lg">
              Híbrido<span className="text-indigo-600">POS</span>
            </span>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              Pedido Confirmado Online
            </span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          <div className="bg-white border border-emerald-200 rounded-3xl p-8 shadow-sm text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <h1 className="text-2xl font-black text-slate-900">¡Gracias por tu compra!</h1>
            <p className="text-sm text-slate-500">
              Tu pedido ha sido procesado de forma exitosa y el pago ha sido confirmado.
            </p>
            <div className="inline-block bg-slate-100 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-800">
              Número de Pedido: #PED-{pedidoConfirmado.id_venta}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Metadatos de la orden */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Fecha y Hora</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {new Date(pedidoConfirmado.fecha).toLocaleString("es-CO", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Canal de Venta</p>
                <p className="font-semibold text-indigo-600 mt-0.5">Online (E-Commerce)</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Método de Pago</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {pedidoConfirmado.medio_pago.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Referencia Pasarela</p>
                <p className="font-mono font-bold text-slate-800 mt-0.5 truncate">
                  {pedidoConfirmado.referencia_pago}
                </p>
              </div>
            </div>

            {/* Datos de Entrega */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Datos de Entrega y Envío
              </h2>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {pedidoConfirmado.cliente_nombre}
                </p>
                <p className="text-slate-600">
                  Dirección: <strong>{pedidoConfirmado.direccion_envio}</strong>
                </p>
                <p className="text-slate-600">
                  Ciudad: <strong>{pedidoConfirmado.ciudad_envio}</strong>
                </p>
                <p className="text-slate-600">
                  Teléfono de contacto: <strong>{pedidoConfirmado.telefono_envio}</strong>
                </p>
              </div>
            </div>

            {/* Desglose de Artículos */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Resumen de Artículos Adquiridos
              </h2>
              <div className="divide-y divide-slate-100">
                {pedidoConfirmado.detalles.map((d) => (
                  <div key={d.id_detalle} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{d.nombre}</p>
                      <p className="text-slate-400">
                        {d.cantidad} × {formatearPrecio(d.precio_unitario)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatearPrecio(d.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatearPrecio(pedidoConfirmado.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Costo de Envío</span>
                  <span className="text-emerald-600 font-bold">¡Gratis!</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Pagado</span>
                  <span className="text-emerald-600">{formatearPrecio(pedidoConfirmado.total)}</span>
                </div>
              </div>
            </div>

            {/* Acciones finales */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/catalogo"
                className="flex-1 text-center py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-sm transition"
              >
                ← Seguir comprando en el catálogo
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-6 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
              >
                🖨️ Imprimir comprobante
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de carga inicial
  if (cargandoPerfil || !cargado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Cargando proceso de pago…</p>
        </div>
      </div>
    );
  }

  // Validación de Usuario No Autenticado
  if (autenticado === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <span className="text-4xl">🔐</span>
          <h1 className="text-xl font-bold text-slate-900">Inicia sesión para continuar</h1>
          <p className="text-xs text-slate-500">
            Para garantizar la seguridad de tu orden y asociar tu pedido online, debes ingresar a tu cuenta de cliente.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/login"
              className="py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-sm"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
            >
              Crear una cuenta nueva
            </Link>
            <Link href="/carrito" className="text-xs text-slate-400 hover:underline pt-2">
              ← Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Validación de Carrito Vacío
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <span className="text-4xl">🛒</span>
          <h1 className="text-xl font-bold text-slate-900">Tu carrito está vacío</h1>
          <p className="text-xs text-slate-500">
            No tienes artículos pendientes de pago en tu carrito de compras.
          </p>
          <Link
            href="/catalogo"
            className="inline-block py-2.5 px-6 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-sm"
          >
            Ir al catálogo de productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/carrito" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Volver al carrito
          </Link>
          <span className="font-extrabold text-slate-900">
            Híbrido<span className="text-indigo-600">POS</span> · Checkout Online
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            🔒 Checkout Seguro
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={manejarCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Datos de Entrega y Pasarela de Pago */}
          <div className="lg:col-span-2 space-y-6">
            {/* SECCIÓN 1: DATOS DE ENVÍO Y CONTACTO (CA1) */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">📍</span>
                <div>
                  <h2 className="font-bold text-slate-900">1. Datos de Entrega</h2>
                  <p className="text-xs text-slate-500">
                    Verifica la dirección y teléfono para la entrega de tu pedido
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="destinatario" className="block text-xs font-semibold text-slate-700">
                    Nombre del Destinatario *
                  </label>
                  <input
                    id="destinatario"
                    type="text"
                    required
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Nombre completo"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="direccion" className="block text-xs font-semibold text-slate-700">
                    Dirección de Envío (Calle, Carrera, No., Apto/Casa) *
                  </label>
                  <input
                    id="direccion"
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. Calle 123 # 45 - 67 Torre 2 Apto 301"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label htmlFor="ciudad" className="block text-xs font-semibold text-slate-700">
                    Ciudad de Entrega *
                  </label>
                  <select
                    id="ciudad"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    {CIUDADES_PRINCIPALES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {ciudad === "Otra ciudad" && (
                    <input
                      type="text"
                      required
                      placeholder="Escribe el nombre de tu ciudad"
                      value={otraCiudad}
                      onChange={(e) => setOtraCiudad(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-600"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-xs font-semibold text-slate-700">
                    Teléfono Celular de Contacto *
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 300 123 4567"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={guardarDatosEnvio}
                    onChange={(e) => setGuardarDatosEnvio(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Actualizar estos datos como mi dirección y teléfono predeterminados</span>
                </label>
              </div>
            </section>

            {/* SECCIÓN 2: MODALIDAD DE PAGO VIRTUAL (CA2) */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">💳</span>
                <div>
                  <h2 className="font-bold text-slate-900">2. Método de Pago Virtual</h2>
                  <p className="text-xs text-slate-500">
                    Selecciona tu modalidad de pago electrónico preferida
                  </p>
                </div>
              </div>

              {/* Selector de Métodos de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMedioPago("TARJETA_CREDITO")}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                    medioPago === "TARJETA_CREDITO"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-bold text-xs text-slate-900">Tarjeta de Crédito</p>
                    <p className="text-[10px] text-slate-500">Visa, Mastercard, Amex</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMedioPago("PSE")}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                    medioPago === "PSE"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">🏦</span>
                  <div>
                    <p className="font-bold text-xs text-slate-900">Débito PSE</p>
                    <p className="text-[10px] text-slate-500">Cuentas de ahorro/corriente</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMedioPago("TRANSFERENCIA")}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                    medioPago === "TRANSFERENCIA"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-bold text-xs text-slate-900">Transferencia / QR</p>
                    <p className="text-[10px] text-slate-500">Bancolombia, Nequi</p>
                  </div>
                </button>
              </div>

              {/* FORMULARIO SIMULADO: TARJETA DE CRÉDITO */}
              {medioPago === "TARJETA_CREDITO" && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-700">Pasarela Virtual de Tarjetas</span>
                    <span>Modo Simulación Activo</span>
                  </div>

                  <div>
                    <label htmlFor="tarjetaNumero" className="block text-xs font-semibold text-slate-700">
                      Número de Tarjeta *
                    </label>
                    <input
                      id="tarjetaNumero"
                      type="text"
                      required
                      value={tarjetaNumero}
                      onChange={(e) => formatearTarjeta(e.target.value)}
                      placeholder="4532 0123 4567 8910"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="tarjetaNombre" className="block text-xs font-semibold text-slate-700">
                      Nombre Impreso en la Tarjeta *
                    </label>
                    <input
                      id="tarjetaNombre"
                      type="text"
                      required
                      value={tarjetaNombre}
                      onChange={(e) => setTarjetaNombre(e.target.value.toUpperCase())}
                      placeholder="JUAN PEREZ"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="tarjetaVencimiento" className="block text-xs font-semibold text-slate-700">
                        Vence (MM/AA) *
                      </label>
                      <input
                        id="tarjetaVencimiento"
                        type="text"
                        required
                        value={tarjetaVencimiento}
                        onChange={(e) => formatearVencimiento(e.target.value)}
                        placeholder="12/28"
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:border-indigo-600 text-center"
                      />
                    </div>
                    <div>
                      <label htmlFor="tarjetaCvv" className="block text-xs font-semibold text-slate-700">
                        CVV *
                      </label>
                      <input
                        id="tarjetaCvv"
                        type="password"
                        maxLength={4}
                        required
                        value={tarjetaCvv}
                        onChange={(e) => setTarjetaCvv(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:border-indigo-600 text-center"
                      />
                    </div>
                    <div>
                      <label htmlFor="tarjetaCuotas" className="block text-xs font-semibold text-slate-700">
                        Cuotas *
                      </label>
                      <select
                        id="tarjetaCuotas"
                        value={tarjetaCuotas}
                        onChange={(e) => setTarjetaCuotas(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600"
                      >
                        <option value="1">1 cuota</option>
                        <option value="3">3 cuotas</option>
                        <option value="6">6 cuotas</option>
                        <option value="12">12 cuotas</option>
                        <option value="24">24 cuotas</option>
                        <option value="36">36 cuotas</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* FORMULARIO SIMULADO: PSE */}
              {medioPago === "PSE" && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-700">Pasarela Virtual PSE</span>
                    <span>Débito desde cuenta bancaria</span>
                  </div>

                  <div>
                    <label htmlFor="pseBanco" className="block text-xs font-semibold text-slate-700">
                      Entidad Financiera (Banco) *
                    </label>
                    <select
                      id="pseBanco"
                      value={pseBanco}
                      onChange={(e) => setPseBanco(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600"
                    >
                      {BANCOS_PSE.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pseTipoPersona" className="block text-xs font-semibold text-slate-700">
                      Tipo de Cliente *
                    </label>
                    <select
                      id="pseTipoPersona"
                      value={pseTipoPersona}
                      onChange={(e) => setPseTipoPersona(e.target.value as "NATURAL" | "JURIDICA")}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600"
                    >
                      <option value="NATURAL">Persona Natural</option>
                      <option value="JURIDICA">Persona Jurídica</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pseCorreo" className="block text-xs font-semibold text-slate-700">
                      Correo Electrónico Registrado en PSE *
                    </label>
                    <input
                      id="pseCorreo"
                      type="email"
                      required
                      value={pseCorreo}
                      onChange={(e) => setPseCorreo(e.target.value)}
                      placeholder="tu_correo@ejemplo.com"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* FORMULARIO SIMULADO: TRANSFERENCIA BANCARIA */}
              {medioPago === "TRANSFERENCIA" && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-700">Datos para Transferencia Bancaria</span>
                    <span>Pago Electrónico Directo</span>
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-4 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Banco:</span>
                      <strong className="text-slate-800">Bancolombia</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cuenta de Ahorros:</span>
                      <strong className="text-slate-800">123-456789-01</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Titular:</span>
                      <strong className="text-slate-800">POS Híbrido S.A.S.</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">NIT:</span>
                      <strong className="text-slate-800">900.123.456-7</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Nequi / Dale:</span>
                      <strong className="text-slate-800">300 123 4567</strong>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="transferenciaComprobante"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Número de Aprobación o Referencia del Comprobante *
                    </label>
                    <input
                      id="transferenciaComprobante"
                      type="text"
                      required
                      value={transferenciaComprobante}
                      onChange={(e) => setTransferenciaComprobante(e.target.value)}
                      placeholder="Ej. C12345678 o Ref 987654"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 outline-none focus:border-indigo-600"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Ingresa el código que arroja tu app bancaria tras realizar la transferencia.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Columna Derecha: Resumen de Compra y Botón de Pago */}
          <div className="space-y-6">
            <aside className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm sticky top-6">
              <h2 className="font-bold text-slate-900 pb-2 border-b border-slate-100">
                Resumen de tu Pedido
              </h2>

              {/* Lista de Ítems */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id_producto} className="py-2.5 flex justify-between text-xs">
                    <div className="pr-2">
                      <p className="font-semibold text-slate-800 truncate max-w-[170px]">
                        {it.nombre}
                      </p>
                      <p className="text-slate-400">
                        {it.cantidad} × {formatearPrecio(it.precio)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      {formatearPrecio(it.precio * it.cantidad)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cantidadTotal} artículos)</span>
                  <span>{formatearPrecio(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío a domicilio</span>
                  <span className="text-emerald-600 font-bold">¡Gratis!</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total a Pagar</span>
                  <span className="text-emerald-600 text-lg">{formatearPrecio(total)}</span>
                </div>
              </div>

              {errorProceso && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  ⚠️ {errorProceso}
                </div>
              )}

              <button
                type="submit"
                disabled={procesando}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {procesando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    <span>Procesando pago en pasarela…</span>
                  </span>
                ) : (
                  `Confirmar y Pagar ${formatearPrecio(total)}`
                )}
              </button>

              <div className="text-center space-y-1 pt-2">
                <p className="text-[11px] text-slate-400">
                  🔒 Transacción protegida con cifrado SSL de 256 bits.
                </p>
                <p className="text-[11px] text-slate-400">
                  Al confirmar, se descontarán las unidades del inventario de forma inmediata.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}
