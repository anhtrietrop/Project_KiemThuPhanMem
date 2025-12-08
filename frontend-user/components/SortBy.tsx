// *********************
// Role of the component: SortBy
// Name of the component: SortBy.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0 - Updated with Vietnamese labels
// Component call: <SortBy />
// Input parameters: no input parameters
// Output: select input with options for sorting by a-z, z-a, price low, price high
// *********************

"use client";
import React from "react";
import { useSortStore } from "@/app/_zustand/sortStore";

const SortBy = () => {
  // getting values from Zustand sort store
  const { sortBy, changeSortBy } = useSortStore();

  return (
    <div className="flex items-center gap-x-3 max-lg:flex-col max-lg:w-full max-lg:items-start">
      <h3 className="text-lg font-medium text-gray-700">Sắp xếp:</h3>
      <select
        value={sortBy}
        onChange={(e) => changeSortBy(e.target.value)}
        className="select border-gray-300 py-2 px-3 text-base border rounded-lg w-48 focus:outline-none focus:border-blue-500 max-lg:w-full bg-white cursor-pointer"
        name="sort"
        aria-label="Sắp xếp sản phẩm"
        title="Sắp xếp sản phẩm"
      >
        <option value="defaultSort">Mặc định</option>
        <option value="titleAsc">Tên A-Z</option>
        <option value="titleDesc">Tên Z-A</option>
        <option value="lowPrice">Giá thấp đến cao</option>
        <option value="highPrice">Giá cao đến thấp</option>
      </select>
    </div>
  );
};

export default SortBy;
