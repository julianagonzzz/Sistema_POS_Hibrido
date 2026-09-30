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
  fallbackEmoji = "📦",
}: ProductImageProps) {
  const [errorCarga, setErrorCarga] = useState(false);

  if (!src || src.trim() === "" || errorCarga) {
    return (
      <span className="text-4xl select-none" role="img" aria-label={alt}>
        {fallbackEmoji}
      </span>
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

  // Si es un emoji o texto corto
  return (
    <span className="text-4xl select-none" role="img" aria-label={alt}>
      {limpio}
    </span>
  );
}

export default ProductImage;
