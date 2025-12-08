// *********************
// Role of the component: Filters on shop page
// Name of the component: Filters.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.1 - Added Apply Filter button, improved UX
// Component call: <Filters />
// Input parameters: no input parameters
// Output: stock, rating and price filter
// *********************

"use client";
import React, { useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSortStore } from "@/app/_zustand/sortStore";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import { formatCurrencyVND } from "@/utils/currency";

interface InputCategory {
  inStock: { text: string; isChecked: boolean };
  outOfStock: { text: string; isChecked: boolean };
  priceFilter: { text: string; value: number };
  ratingFilter: { text: string; value: number };
}

// Price range constants (in VND)
const MIN_PRICE = 0;
const MAX_PRICE = 10000000; // 10 triệu VND
const PRICE_STEP = 100000; // 100k VND step

const Filters = () => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  // getting current page number from Zustand store
  const { resetPage } = usePaginationStore();

  const [inputCategory, setInputCategory] = useState<InputCategory>({
    inStock: { text: "instock", isChecked: true },
    outOfStock: { text: "outofstock", isChecked: true },
    priceFilter: { text: "price", value: MAX_PRICE },
    ratingFilter: { text: "rating", value: 0 },
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const { sortBy } = useSortStore();

  // Handle filter changes - mark as having changes
  const handleFilterChange = (newCategory: InputCategory) => {
    setInputCategory(newCategory);
    setHasChanges(true);
  };

  // Apply filters when button is clicked
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set("outOfStock", inputCategory.outOfStock.isChecked.toString());
    params.set("inStock", inputCategory.inStock.isChecked.toString());
    params.set("rating", inputCategory.ratingFilter.value.toString());
    params.set("price", inputCategory.priceFilter.value.toString());
    params.set("sort", sortBy);
    params.set("page", "1"); // Reset to page 1 when applying new filters
    resetPage(); // Reset page in store
    replace(`${pathname}?${params}`);
    setHasChanges(false);
  }, [inputCategory, sortBy, pathname, replace, resetPage]);

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      inStock: { text: "instock", isChecked: true },
      outOfStock: { text: "outofstock", isChecked: true },
      priceFilter: { text: "price", value: MAX_PRICE },
      ratingFilter: { text: "rating", value: 0 },
    };
    setInputCategory(defaultFilters);
    setHasChanges(true);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Bộ lọc</h3>
      
      {/* Availability Filter */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Tình trạng</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors">
            <input
              type="checkbox"
              checked={inputCategory.inStock.isChecked}
              onChange={() =>
                handleFilterChange({
                  ...inputCategory,
                  inStock: {
                    text: "instock",
                    isChecked: !inputCategory.inStock.isChecked,
                  },
                })
              }
              className="checkbox checkbox-primary checkbox-sm"
            />
            <span className="ml-3 text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Còn hàng
            </span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors">
            <input
              type="checkbox"
              checked={inputCategory.outOfStock.isChecked}
              onChange={() =>
                handleFilterChange({
                  ...inputCategory,
                  outOfStock: {
                    text: "outofstock",
                    isChecked: !inputCategory.outOfStock.isChecked,
                  },
                })
              }
              className="checkbox checkbox-primary checkbox-sm"
            />
            <span className="ml-3 text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Hết hàng
            </span>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      {/* Price Filter */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Khoảng giá</h4>
        <div className="px-1">
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={PRICE_STEP}
            value={inputCategory.priceFilter.value}
            className="range range-primary range-sm w-full"
            aria-label="Lọc theo giá"
            title="Lọc theo giá"
            onChange={(e) =>
              handleFilterChange({
                ...inputCategory,
                priceFilter: {
                  text: "price",
                  value: Number(e.target.value),
                },
              })
            }
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{formatCurrencyVND(MIN_PRICE)}</span>
            <span className="font-semibold text-blue-600">
              Tối đa: {formatCurrencyVND(inputCategory.priceFilter.value)}
            </span>
          </div>
          {/* Quick price buttons */}
          <div className="flex flex-wrap gap-1 mt-3">
            {[1000000, 2000000, 5000000, 10000000].map((price) => (
              <button
                key={price}
                type="button"
                onClick={() =>
                  handleFilterChange({
                    ...inputCategory,
                    priceFilter: { text: "price", value: price },
                  })
                }
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  inputCategory.priceFilter.value === price
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-500"
                }`}
              >
                {price >= 1000000 ? `${price / 1000000}tr` : `${price / 1000}k`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      {/* Rating Filter */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Đánh giá tối thiểu</h4>
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={5}
            value={inputCategory.ratingFilter.value}
            onChange={(e) =>
              handleFilterChange({
                ...inputCategory,
                ratingFilter: { text: "rating", value: Number(e.target.value) },
              })
            }
            className="range range-warning range-sm w-full"
            step="1"
            aria-label="Lọc theo đánh giá"
            title="Lọc theo đánh giá"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={`cursor-pointer hover:text-yellow-500 ${
                  inputCategory.ratingFilter.value === num
                    ? "text-yellow-500 font-bold"
                    : ""
                }`}
                onClick={() =>
                  handleFilterChange({
                    ...inputCategory,
                    ratingFilter: { text: "rating", value: num },
                  })
                }
              >
                {num === 0 ? "Tất cả" : `${num}★`}
              </span>
            ))}
          </div>
          {inputCategory.ratingFilter.value > 0 && (
            <div className="mt-2 text-center">
              <span className="text-yellow-500">
                {"★".repeat(inputCategory.ratingFilter.value)}
                {"☆".repeat(5 - inputCategory.ratingFilter.value)}
              </span>
              <span className="text-sm text-gray-500 ml-2">trở lên</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        {/* Apply Filter Button */}
        <button
          type="button"
          onClick={applyFilters}
          disabled={!hasChanges}
          className={`w-full py-3 px-4 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 ${
            hasChanges
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Áp dụng bộ lọc
        </button>

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={resetFilters}
          className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    </div>
  );
};

export default Filters;
