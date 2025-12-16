"use client";

import Image from "next/image";
import React from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

const ProductImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: ProductImageProps) => {
  const resolvedSrc = src || "/product_placeholder.jpg";
  const isBackendUpload = resolvedSrc.includes("/uploads/");

  if (isBackendUpload) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className ?? ""} object-contain`}
        onError={(event) => {
          const target = event.target as HTMLImageElement;
          if (target.src !== "/product_placeholder.jpg") {
            target.src = "/product_placeholder.jpg";
          }
        }}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      width={width}
      height={height}
      alt={alt}
      className={className}
      priority={priority}
    />
  );
};

export default ProductImage;
