// *********************
// Role of the component: Product item component
// Name of the component: ProductItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component that contains product image, title, link to the single product page, price, button...
// *********************

import Image from "next/image";
import React from "react";
import Link from "next/link";
import ProductItemRating from "./ProductItemRating";
import { sanitize } from "@/lib/sanitize";
import { useTranslation } from '@/hooks/useTranslation'

const ProductItem = ({
  product,
  color,
  viewMode = 'grid',
}: {
  product: Product;
  color: string;
  viewMode?: 'grid' | 'list';
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex gap-6 items-center">
        <Link href={`/product/${product.slug}`} className="flex-shrink-0">
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            width={150}
            height={150}
            className="w-[150px] h-[150px] object-cover rounded-lg"
            alt={sanitize(product?.title) || "Product image"}
          />
        </Link>

        <div className="flex-1">
          <Link
            href={`/product/${product.slug}`}
            className="text-xl text-black font-semibold hover:text-blue-600 transition-colors"
          >
            {sanitize(product.title)}
          </Link>

          <div className="mt-2 flex items-center gap-4">
            <p className="text-lg text-blue-600 font-bold">${product.price}</p>
            <ProductItemRating productRating={product?.rating} />
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Số lượng: {product.quantity > 0 ? `${product.quantity} còn hàng` : 'Hết hàng'}
          </p>

          <Link
            href={`/product/${product?.slug}`}
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="flex flex-col items-center gap-y-2">
      <Link href={`/product/${product.slug}`}>
        <Image
          src={
            product.mainImage
              ? `/${product.mainImage}`
              : "/product_placeholder.jpg"
          }
          width="0"
          height="0"
          sizes="100vw"
          className="w-auto h-[300px]"
          alt={sanitize(product?.title) || "Product image"}
        />
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
        ${product.price}
      </p>

      <ProductItemRating productRating={product?.rating} />
      <p
        className={
          color === "black"
            ? "text-sm text-black font-normal"
            : "text-sm text-white font-normal"
        }
      >
        Số lượng: {product.quantity > 0 ? `${product.quantity} còn hàng` : 'Hết hàng'}
      </p>
      <Link
        href={`/product/${product?.slug}`}
        className="block flex justify-center items-center w-full uppercase bg-white px-0 py-2 text-base border border-black border-gray-300 font-bold text-blue-600 shadow-sm hover:bg-black hover:bg-gray-100 focus:outline-none focus:ring-2"
      >
        <p>Xem sản phẩm</p>
      </Link>
    </div>
  );
};

export default ProductItem;
