"use client";

import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackEmoji?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className = "w-full h-full object-contain p-2",
}: ProductImageProps) {
  const [errorCarga, setErrorCarga] = useState(false);

  if (!src || src.trim() === "" || errorCarga) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300">
        <svg className="w-12 h-12 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </div>
    );
  }

  const limpio = src.trim();
  const esUrlOArchivo =
    limpio.startsWith("/") ||
    limpio.startsWith("http://") ||
    limpio.startsWith("https://") ||
    limpio.startsWith("data:image/");

  if (esUrlOArchivo) {
    return (
      <img
        src={limpio}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setErrorCarga(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-slate-300">
      <svg className="w-12 h-12 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </div>
  );
}

export default ProductImage;
