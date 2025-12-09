// *********************
// Role of the component: Filters on shop page
// Name of the component: Filters.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.2 - Added Category filter, improved price range inputs
// Component call: <Filters />
// Input parameters: no input parameters
// Output: category, stock, rating and price filter
// *********************

"use client";
import React, { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSortStore } from "@/app/_zustand/sortStore";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import apiClient from "@/lib/api";

interface Category {
  id: string;
  name: string;
}

interface InputCategory {
  inStock: { text: string; isChecked: boolean };
  outOfStock: { text: string; isChecked: boolean };
  priceFilter: { text: string; minValue: number; maxValue: string };
  ratingFilter: { text: string; value: number };
  categoryId: string;
}

const Filters = () => {
  const pathname = usePathname();
  const { replace } = useRouter();

  // getting current page number from Zustand store
  const { resetPage } = usePaginationStore();

  // Categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [inputCategory, setInputCategory] = useState<InputCategory>({
    inStock: { text: "instock", isChecked: true },
    outOfStock: { text: "outofstock", isChecked: true },
    priceFilter: { text: "price", minValue: 0, maxValue: "" }, // "" = unlimited
    ratingFilter: { text: "rating", value: 0 },
    categoryId: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const { sortBy } = useSortStore();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

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
    params.set("minPrice", inputCategory.priceFilter.minValue.toString());
    if (inputCategory.priceFilter.maxValue !== "") {
      params.set("maxPrice", inputCategory.priceFilter.maxValue);
    }
    if (inputCategory.categoryId) {
      params.set("category", inputCategory.categoryId);
    }
    params.set("sort", sortBy);
    params.set("page", "1"); // Reset to page 1 when applying new filters
    resetPage(); // Reset page in store
    replace(`${pathname}?${params}`);
    setHasChanges(false);
  }, [inputCategory, sortBy, pathname, replace, resetPage]);

  // Reset filters
  const resetFilters = () => {
    const defaultFilters: InputCategory = {
      inStock: { text: "instock", isChecked: true },
      outOfStock: { text: "outofstock", isChecked: true },
      priceFilter: { text: "price", minValue: 0, maxValue: "" },
      ratingFilter: { text: "rating", value: 0 },
      categoryId: "",
    };
    setInputCategory(defaultFilters);
    setHasChanges(true);
  };

  // Parse price from input
  const parsePriceInput = (value: string): number => {
    const parsed = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Bộ lọc</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Danh mục</h4>
        <select
          value={inputCategory.categoryId}
          onChange={(e) =>
            handleFilterChange({ ...inputCategory, categoryId: e.target.value })
          }
          className="select select-bordered w-full bg-white text-gray-700"
          disabled={loadingCategories}
          aria-label="Chọn danh mục"
          title="Chọn danh mục sản phẩm"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

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

      {/* Price Filter - From 0 to Unlimited */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Khoảng giá</h4>

        <div className="space-y-3">
          {/* Min Price Input */}
          <div>
            <label htmlFor="minPrice" className="text-xs text-gray-500 block mb-1">Từ</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                ₫
              </span>
              <input
                id="minPrice"
                type="text"
                value={inputCategory.priceFilter.minValue.toLocaleString("vi-VN")}
                onChange={(e) =>
                  handleFilterChange({
                    ...inputCategory,
                    priceFilter: {
                      ...inputCategory.priceFilter,
                      minValue: parsePriceInput(e.target.value),
                    },
                  })
                }
                className="input input-bordered w-full pl-7 bg-white text-gray-700"
                placeholder="0"
                aria-label="Giá tối thiểu"
                title="Nhập giá tối thiểu"
              />
            </div>
          </div>

          {/* Max Price Input */}
          <div>
            <label htmlFor="maxPrice" className="text-xs text-gray-500 block mb-1">Đến</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                ₫
              </span>
              <input
                id="maxPrice"
                type="text"
                value={
                  inputCategory.priceFilter.maxValue !== ""
                    ? Number(inputCategory.priceFilter.maxValue).toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.trim();
                  handleFilterChange({
                    ...inputCategory,
                    priceFilter: {
                      ...inputCategory.priceFilter,
                      maxValue: value === "" ? "" : parsePriceInput(value).toString(),
                    },
                  });
                }}
                className="input input-bordered w-full pl-7 bg-white text-gray-700"
                placeholder="Không giới hạn"
                aria-label="Giá tối đa"
                title="Nhập giá tối đa (để trống = không giới hạn)"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Để trống = không giới hạn
            </span>
          </div>
        </div>

        {/* Quick price range buttons */}
        <div className="flex flex-wrap gap-1 mt-4">
          {[
            { min: 0, max: "2000000", label: "Dưới 2tr" },
            { min: 2000000, max: "5000000", label: "2-5tr" },
            { min: 5000000, max: "10000000", label: "5-10tr" },
            { min: 10000000, max: "", label: "Trên 10tr" },
          ].map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() =>
                handleFilterChange({
                  ...inputCategory,
                  priceFilter: {
                    text: "price",
                    minValue: range.min,
                    maxValue: range.max,
                  },
                })
              }
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                inputCategory.priceFilter.minValue === range.min &&
                inputCategory.priceFilter.maxValue === range.max
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-500"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      {/* Rating Filter */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">
          Đánh giá tối thiểu
        </h4>
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
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Áp dụng bộ lọc
        </button>

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
