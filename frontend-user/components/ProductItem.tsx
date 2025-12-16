// *********************
// Role of the component: Product item component
// Name of the component: ProductItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component that contains product image, title, link to the single product page, price, button...
// *********************

"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import ProductItemRating from "./ProductItemRating";
import { sanitize } from "@/lib/sanitize";
import { formatCurrencyVND } from "@/utils/currency";
import { getImageSrc } from "@/utils/imageHelper";

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-y-2">
      <Link href={`/product/${product.slug}`}>
        {(() => {
          const src = getImageSrc(product.mainImage);
          // If image comes from backend uploads (local /uploads path), use native <img>
          if (src.includes("/uploads/")) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                className="w-auto h-[300px] object-contain"
                alt={sanitize(product?.title) || "Product image"}
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.src = "/product_placeholder.jpg";
                }}
              />
            );
          }

          return (
            <Image
              src={src}
              width={0}
              height={0}
              sizes="100vw"
              className="w-auto h-[300px]"
              alt={sanitize(product?.title) || "Product image"}
            />
          );
        })()}
      </Link>
      <Link
        href={`/product/${product.slug}`}
        className={
          color === "black"
            ? `text-xl text-black font-normal mt-2 uppercase`
            : `text-xl text-white font-normal mt-2 uppercase`
        }
      >
        {sanitize(product.title)}
      </Link>
      <p
        className={
          color === "black"
            ? "text-lg text-black font-semibold"
            : "text-lg text-white font-semibold"
        }
      >
        {formatCurrencyVND(product.price)}
      </p>

      <ProductItemRating productRating={product?.rating} />
      <p
        className={
          color === "black"
            ? "text-sm text-black font-normal"
            : "text-sm text-white font-normal"
        }
      >
        Quantity:{" "}
        {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
      </p>
      <Link
        href={`/product/${product?.slug}`}
        className="block flex justify-center items-center w-full uppercase bg-white px-0 py-2 text-base border border-black border-gray-300 font-bold text-blue-600 shadow-sm hover:bg-black hover:bg-gray-100 focus:outline-none focus:ring-2"
      >
        <p>View product</p>
      </Link>
    </div>
  );
};

export default ProductItem;
