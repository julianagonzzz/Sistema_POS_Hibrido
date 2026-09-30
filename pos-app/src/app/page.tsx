import Link from "next/link";
import { listarProductosDestacados, Producto } from "@/lib/productos";
import { ProductImage } from "@/components/ProductImage";

function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const CATEGORIAS_DESTACADAS = [
  { nombre: "Celulares", icono: "📱", desc: "Smartphones, iPhones y smartwatches" },
  { nombre: "Computadores", icono: "💻", desc: "Laptops con IA, iPads y monitores" },
  { nombre: "Televisores", icono: "📺", desc: "Smart TV 4K, torres de sonido y audio" },
  { nombre: "Videojuegos", icono: "🎮", desc: "Consolas PS5, Switch y mandos" },
  { nombre: "Accesorios", icono: "⌨️", desc: "Mouse gamer, diademas y cámaras" },
  { nombre: "Electrodomésticos", icono: "🍳", desc: "Airfryers, secadores y smart home" },
  { nombre: "Deportes", icono: "🚴", desc: "Spinning, fitness y entrenamiento" },
];

export default async function HomePage() {
  let productosDestacados: Producto[] = [];
  try {
    productosDestacados = await listarProductosDestacados(8);
  } catch (error) {
    console.error("Error al cargar productos destacados:", error);
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
      {/* Barra de Navegación Superior Limpia y Blanca */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo oficial de NexoVolk */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/nexovolk-logo.png"
              alt="NexoVolk"
              className="w-10 h-10 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Nexo<span className="text-orange-500">Volk</span>
            </span>
          </Link>

          {/* Botones a la derecha */}
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <span>Catálogo</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Claro / Blanco */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white py-14 sm:py-18 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Vive el futuro con la mejor <span className="text-blue-600">tecnología</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Descubre dispositivos de vanguardia con inventario sincronizado en tiempo real y garantía oficial de marcas líderes.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Link
                href="/catalogo"
                className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all inline-flex items-center gap-2"
              >
                <span>Explorar Catálogo</span>
                <span className="text-lg">→</span>
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-base shadow-xs transition-colors"
              >
                Acceso Vendedores / POS
              </Link>
            </div>
          </div>

          {/* Grid de Categorías Principales */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 max-w-6xl mx-auto">
            {CATEGORIAS_DESTACADAS.map((cat) => (
              <Link
                key={cat.nombre}
                href="/catalogo"
                className="bg-white hover:bg-blue-50/40 p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center group flex flex-col items-center shadow-xs"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.icono}
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {cat.nombre}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Productos Destacados & Novedades
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Catálogo sincronizado con base de datos en tiempo real.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 hover:underline"
          >
            Ver todos los productos en el catálogo →
          </Link>
        </div>

        {/* Rejilla de productos destacados */}
        {productosDestacados.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-500">No hay productos registrados actualmente en la base de datos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosDestacados.map((prod) => (
              <div
                key={prod.id_producto}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col group"
              >
                {/* Contenedor de Imagen */}
                <div className="h-52 bg-slate-50/60 flex items-center justify-center relative select-none p-4 overflow-hidden border-b border-slate-100">
                  <ProductImage
                    src={prod.imagen_url}
                    alt={prod.nombre}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    fallbackEmoji="⚡"
                  />

                  {/* Badge de Stock */}
                  <span
                    className={`absolute top-3 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-xs ${
                      prod.cantidad_stock > 0
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-rose-100 text-rose-800 border-rose-200"
                    }`}
                  >
                    {prod.cantidad_stock > 0 ? `Stock: ${prod.cantidad_stock}` : "Agotado"}
                  </span>

                  {/* Badge de Marca y Especificación */}
                  {(prod.genero || prod.talla) && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 bg-white/95 text-slate-700 rounded-md backdrop-blur-xs border border-slate-200 shadow-xs">
                      {prod.genero && prod.genero !== "Unisex" ? `${prod.genero} • ` : ""}
                      {prod.talla && prod.talla !== "Única" ? prod.talla : "Tech"}
                    </span>
                  )}
                </div>

                {/* Contenido del producto */}
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      {prod.categoria}
                    </span>
                    {prod.codigo_barras && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {prod.codigo_barras}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[2.5rem]">
                    {prod.nombre}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 flex-1 leading-relaxed">
                    {prod.descripcion}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Precio
                      </span>
                      <span className="text-lg font-black text-orange-600">
                        {formatearPrecio(prod.precio)}
                      </span>
                    </div>

                    <Link
                      href="/catalogo"
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 transition-all"
                    >
                      Ver en catálogo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner Promocional NexoVolk */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-200">Garantía Directa NexoVolk</span>
            <h3 className="text-2xl sm:text-3xl font-black">Tecnología de última generación a tu alcance</h3>
            <p className="text-blue-100 text-sm max-w-xl">
              Equipos certificados por fabricantes oficiales: Apple, Samsung, HP, Sony, Logitech y Xiaomi con facturación en punto de venta y tienda online.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="whitespace-nowrap px-7 py-3.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl shadow-md transition-all text-sm uppercase tracking-wide"
          >
            Ir al Catálogo Completo
          </Link>
        </div>
      </main>

      {/* Footer Blanco */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-700 tracking-wide">
            NEXOVOLK • Sistema POS de Facturación e Inventario
          </p>
          <p className="text-slate-400">
            © 2026 NexoVolk. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
