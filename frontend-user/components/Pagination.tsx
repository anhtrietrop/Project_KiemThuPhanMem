// *********************
// Role of the component: Pagination for navigating the shop page
// Name of the component: Pagination.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0 - Improved UI with page numbers
// Component call: <Pagination />
// Input parameters: no input parameters
// Output: Component with the current page, page numbers and navigation buttons
// *********************

"use client";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import React from "react";

const Pagination = () => {
  // getting from Zustand store current page and methods
  const { page, totalPages, incrementPage, decrementPage, setPage } = usePaginationStore();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center py-10 gap-1">
      {/* Previous Button */}
      <button
        onClick={() => decrementPage()}
        disabled={page === 1}
        className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
          page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 hover:bg-blue-500 hover:text-white hover:border-blue-500 border-gray-300"
        }`}
        aria-label="Trang trước"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {pageNumbers.map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => setPage(pageNum as number)}
                className={`min-w-[40px] px-3 py-2 rounded-lg border transition-all duration-200 font-medium ${
                  page === pageNum
                    ? "bg-blue-500 text-white border-blue-500 shadow-md"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500 border-gray-300"
                }`}
              >
                {pageNum}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => incrementPage()}
        disabled={page >= totalPages}
        className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
          page >= totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 hover:bg-blue-500 hover:text-white hover:border-blue-500 border-gray-300"
        }`}
        aria-label="Trang sau"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
