import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "./carrito/CarritoContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Katronix POS - Pasión por la Tecnología",
  description: "Sistema POS y Tienda Omnicanal de Electrónica, Computadores, Televisores, Gaming y Electrohogar",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* US_09: el carrito está disponible en toda la app */}
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}
