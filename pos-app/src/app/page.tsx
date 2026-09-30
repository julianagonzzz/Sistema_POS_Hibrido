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
  { nombre: "Computadores", icono: "💻", desc: "Laptops con IA, gamer y monitores" },
  { nombre: "Televisores", icono: "📺", desc: "Smart TV 4K, barras de sonido y audio" },
  { nombre: "Videojuegos", icono: "🎮", desc: "Consolas PS5, Switch y mandos" },
  { nombre: "Accesorios", icono: "⌨️", desc: "Mouse gamer, teclados y hubs USB-C" },
  { nombre: "Electrodomésticos", icono: "🍳", desc: "Airfryers, cafeteras y robots aspiradora" },
];

export default async function HomePage() {
  let productosDestacados: Producto[] = [];
  try {
    productosDestacados = await listarProductosDestacados(8);
  } catch (error) {
    console.error("Error al cargar productos destacados:", error);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Barra de Navegación Superior Estilo Katronix */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Marca */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  KATRONIX<span className="text-orange-500">POS</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  Tech Store
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Pasión por la Tecnología & Electrohogar
              </p>
            </div>
          </Link>

          {/* Botones a la derecha */}
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span>Catálogo Tech</span>
              <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                En vivo
              </span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all font-medium"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Tecnológico */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 py-16 sm:py-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-4 shadow-sm">
              ⚡ Lo último en Tecnología • Celulares, Portátiles IA, Audio, Gaming y Hogar
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Vive el futuro con la mejor <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-orange-400 bg-clip-text text-transparent">tecnología</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Descubre dispositivos de vanguardia con inventario sincronizado en tiempo real y garantía oficial de marcas líderes.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/catalogo"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 hover:from-blue-500 hover:to-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <span>Explorar Catálogo Tech</span>
                <span className="text-lg">→</span>
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base transition-colors"
              >
                Acceso Vendedores / POS
              </Link>
            </div>
          </div>

          {/* Grid de Categorías Principales */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 max-w-6xl mx-auto">
            {CATEGORIAS_DESTACADAS.map((cat) => (
              <Link
                key={cat.nombre}
                href="/catalogo"
                className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center group flex flex-col items-center"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.icono}
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                  {cat.nombre}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Productos Destacados & Novedades
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Catálogo oficial sincronizado con base de datos PostgreSQL en tiempo real.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 hover:underline"
          >
            Ver todos los productos en el catálogo →
          </Link>
        </div>

        {/* Rejilla de productos destacados */}
        {productosDestacados.length === 0 ? (
          <div className="p-12 text-center bg-slate-800/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400">No hay productos registrados actualmente en la base de datos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosDestacados.map((prod) => (
              <div
                key={prod.id_producto}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-md hover:shadow-xl hover:border-slate-600 transition-all flex flex-col group"
              >
                {/* Contenedor de Imagen */}
                <div className="h-52 bg-white flex items-center justify-center relative select-none p-4 overflow-hidden">
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
                        ? "bg-emerald-500/90 text-white border-emerald-400"
                        : "bg-rose-500/90 text-white border-rose-400"
                    }`}
                  >
                    {prod.cantidad_stock > 0 ? `Stock: ${prod.cantidad_stock}` : "Agotado"}
                  </span>

                  {/* Badge de Marca y Especificación */}
                  {(prod.genero || prod.talla) && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 bg-slate-900/80 text-slate-100 rounded-md backdrop-blur-xs border border-slate-700/60 shadow-xs">
                      {prod.genero && prod.genero !== "Unisex" ? `${prod.genero} • ` : ""}
                      {prod.talla && prod.talla !== "Única" ? prod.talla : "Tech"}
                    </span>
                  )}
                </div>

                {/* Contenido del producto */}
                <div className="p-5 flex flex-col flex-1 bg-slate-850">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      {prod.categoria}
                    </span>
                    {prod.codigo_barras && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {prod.codigo_barras}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug line-clamp-2 min-h-[2.5rem]">
                    {prod.nombre}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 flex-1 leading-relaxed">
                    {prod.descripcion}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-750 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Precio
                      </span>
                      <span className="text-lg font-black text-orange-400">
                        {formatearPrecio(prod.precio)}
                      </span>
                    </div>

                    <Link
                      href="/catalogo"
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition-all"
                    >
                      Ver en catálogo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner Promocional Katronix */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-800/50 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Garantía Directa Katronix</span>
            <h3 className="text-2xl sm:text-3xl font-black">Tecnología de última generación a tu alcance</h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Equipos certificados por fabricantes oficiales: Apple, Samsung, HP, Sony, Logitech y Xiaomi con facturación en punto de venta y tienda online.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="whitespace-nowrap px-7 py-3.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl shadow-lg shadow-orange-500/25 transition-all text-sm uppercase tracking-wide"
          >
            Ir al Catálogo Completo
          </Link>
        </div>
      </main>

      {/* Footer Katronix */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-200 tracking-wide">
            KATRONIX POS • Sistema Híbrido de Facturación e Inventario
          </p>
          <p className="text-slate-500">
            © 2026 Katronix Electronics Store. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

