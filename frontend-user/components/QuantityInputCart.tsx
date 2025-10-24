// *********************
// Role of the component: Quantity input for incrementing and decrementing product quantity on the cart page
// Name of the component: QuantityInputCart.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <QuantityInputCart product={product} />
// Input parameters: { product: ProductInCart }
// Output: one number input and two buttons
// *********************

"use client";
import { ProductInCart, useProductStore } from "@/app/_zustand/store";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import toast from "react-hot-toast";

const QuantityInputCart = ({ product }: { product: ProductInCart }) => {
    const [quantityCount, setQuantityCount] = useState<number>(product.amount);
  const { updateCartAmount, calculateTotals, isLoading } = useProductStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (actionName: string) => {
    let newQuantity: number;

    if (actionName === "plus") {
      newQuantity = quantityCount + 1;
      if (newQuantity > product.quantity) {
        toast.error(`Cannot increase quantity beyond available stock: ${product.quantity} available`);
        return;
      }
    } else if (actionName === "minus") {
      newQuantity = quantityCount - 1;
      if (newQuantity < 1) {
        return;
      }
    } else {
      return;
    }

    setQuantityCount(newQuantity);
    setIsUpdating(true);

    try {
      await updateCartAmount(product.id, newQuantity);
      calculateTotals();
    } catch (error) {
      toast.error("Failed to update quantity.");
      console.error("Error updating cart quantity:", error);
      setQuantityCount(product.amount); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <label htmlFor="Quantity" className="sr-only">
        {" "}
        Quantity{" "}
      </label>

      <div className="flex items-center justify-center rounded border border-gray-200 w-32">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={isUpdating || isLoading || quantityCount <= 1}
          className="size-10 leading-10 text-gray-600 transition hover:opacity-75 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleQuantityChange("minus")}
        >
          <FaMinus />
        </button>

        <input
          type="number"
          id="Quantity"
          disabled={true}
          value={quantityCount}
          className="h-10 w-16 border-transparent text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          aria-label="Increase quantity"
          disabled={isUpdating || isLoading || quantityCount >= product.quantity}
          className="size-10 leading-10 text-gray-600 transition hover:opacity-75 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleQuantityChange("plus")}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default QuantityInputCart;
