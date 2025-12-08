"use client";

import { useEffect } from "react";
import { usePaginationStore } from "@/app/_zustand/paginationStore";

interface PaginationUpdaterProps {
  totalProducts: number;
  productsPerPage?: number;
}

const PaginationUpdater = ({ totalProducts, productsPerPage = 12 }: PaginationUpdaterProps) => {
  const { setTotalPages } = usePaginationStore();

  useEffect(() => {
    const total = Math.ceil(totalProducts / productsPerPage);
    setTotalPages(Math.max(1, total));
  }, [totalProducts, productsPerPage, setTotalPages]);

  return null; // This component doesn't render anything
};

export default PaginationUpdater;
