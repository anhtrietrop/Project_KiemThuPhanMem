"use client";

import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { FaCheck, FaCircleQuestion, FaClock, FaXmark } from "react-icons/fa6";
import QuantityInputCart from "@/components/QuantityInputCart";
import { sanitize } from "@/lib/sanitize";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { formatCurrencyVND } from "@/utils/currency";
import { getImageSrc } from "@/utils/imageHelper";

export const CartModule = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { products, removeFromCart, calculateTotals, total, isLoading } =
    useProductStore();

  // Hydrate from localStorage persisted key in case client state wasn't populated
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (products && products.length > 0) return;

    try {
      const raw = localStorage.getItem("products-storage");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const data = parsed?.state || parsed;
      const persistedProducts = data?.products || [];
      const persistedTotal = data?.total || 0;
      const persistedAllQuantity = data?.allQuantity || 0;
      if (persistedProducts && persistedProducts.length > 0) {
        useProductStore.setState({
          products: persistedProducts,
          total: persistedTotal,
          allQuantity: persistedAllQuantity,
        });
        // Ensure totals calculated for UI
        calculateTotals();
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleRemoveItem = async (id: string) => {
    setRemovingItems((prev) => new Set(prev).add(id));
    try {
      await removeFromCart(id);
      calculateTotals();
      toast.success("Product removed from the cart");
    } catch (error) {
      toast.error("Failed to remove product from cart");
      console.error("Error removing from cart:", error);
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Kiểm tra xem user đã đăng nhập chưa
    if (!session) {
      toast.error("Vui lòng đăng nhập để tiếp tục thanh toán");
      // Redirect đến trang login với callbackUrl để quay lại checkout sau khi đăng nhập
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    // Nếu đã đăng nhập, chuyển đến trang checkout
    router.push("/checkout");
  };
  return (
    <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      <section aria-labelledby="cart-heading" className="lg:col-span-7">
        <h2 id="cart-heading" className="sr-only">
          Items in your shopping cart
        </h2>

        <ul
          role="list"
          className="divide-y divide-gray-200 border-b border-t border-gray-200"
        >
          {products.map((product) => (
            <li
              key={product.id}
              data-cy={`cart-item-${product.id}`}
              className="flex py-6 sm:py-10"
            >
              <div className="flex-shrink-0">
                <Image
                  width={192}
                  height={192}
                  src={getImageSrc(product?.mainImage || product?.image)}
                  alt={product?.title || "Product image"}
                  className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-sm">
                        <Link
                          href={`#`}
                          className="font-medium text-gray-700 hover:text-gray-800"
                        >
                          {sanitize(product.title)}
                        </Link>
                      </h3>
                    </div>
                    {/* <div className="mt-1 flex text-sm">
                        <p className="text-gray-500">{product.color}</p>
                        {product.size ? (
                          <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{product.size}</p>
                        ) : null}
                      </div> */}
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatCurrencyVND(product.price)}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:pr-9">
                    <QuantityInputCart product={product} />
                    <div className="absolute right-0 top-0">
                      <button
                        aria-label="Remove item"
                        data-testid="remove-cart-item"
                        onClick={() => handleRemoveItem(product.id)}
                        type="button"
                        data-cy="remove-item"
                        disabled={isLoading || removingItems.has(product.id)}
                        className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Remove</span>
                        <FaXmark className="h-5 w-5" aria-hidden="true" />
                        <span aria-hidden="true" className="ml-1">
                          ×
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                  {product.quantity > 0 ? (
                    <FaCheck
                      className="h-5 w-5 flex-shrink-0 text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaXmark
                      className="h-5 w-5 flex-shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {product.quantity > 0 ? "In stock" : "Out of stock"}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Order summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
          Order summary
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Tạm tính</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatCurrencyVND(total)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex items-center text-sm text-gray-600">
              <span>Phí vận chuyển (ước tính)</span>
              <a
                href="#"
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">
                  Learn more about how shipping is calculated
                </span>
                <FaCircleQuestion className="h-5 w-5" aria-hidden="true" />
              </a>
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatCurrencyVND(5000)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex text-sm text-gray-600">
              <span>Thuế (ước tính)</span>
              <a
                href="#"
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">
                  Learn more about how tax is calculated
                </span>
                <FaCircleQuestion className="h-5 w-5" aria-hidden="true" />
              </a>
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatCurrencyVND(total / 5)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">Tổng cộng</dt>
            <dd className="text-base font-medium text-gray-900">
              {formatCurrencyVND(
                total === 0 ? 0 : Math.round(total + total / 5 + 5000)
              )}
            </dd>
          </div>
        </dl>
        {products.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleCheckout}
              type="button"
              disabled={status === "loading"}
              className="block flex justify-center items-center w-full uppercase bg-white px-4 py-3 text-base border border-black border-gray-300 font-bold text-blue-600 shadow-sm hover:bg-black hover:bg-gray-100 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{status === "loading" ? "Loading..." : "Checkout"}</span>
            </button>
          </div>
        )}
      </section>
    </form>
  );
};
