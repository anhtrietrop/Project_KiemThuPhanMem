// *********************
// Role of the component: Showing products on the shop page with applied filter and sort
// Name of the component: Products.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.1 - Fixed quantity-based stock filtering, added pagination support
// Component call: <Products params={params} searchParams={searchParams} />
// Input parameters: { params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }
// Output: products grid
// *********************

import React from "react";
import ProductItem from "./ProductItem";
import PaginationUpdater from "./PaginationUpdater";
import apiClient from "@/lib/api";

const PRODUCTS_PER_PAGE = 12;

const Products = async ({ params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }) => {
  // getting all data from URL slug and preparing everything for sending GET request
  const inStockChecked = searchParams?.inStock === "true";
  const outOfStockChecked = searchParams?.outOfStock === "true";
  const page = searchParams?.page ? Number(searchParams?.page) : 1;
  const maxPrice = searchParams?.price ? Number(searchParams?.price) : 10000000;

  // Build quantity filter based on stock checkbox selections
  // quantity > 0 means in stock, quantity = 0 means out of stock
  let quantityFilter = "";
  
  if (inStockChecked && outOfStockChecked) {
    // Both checked: show all products (quantity >= 0)
    quantityFilter = "filters[quantity][$gte]=0";
  } else if (inStockChecked && !outOfStockChecked) {
    // Only in stock: show products with quantity > 0
    quantityFilter = "filters[quantity][$gt]=0";
  } else if (!inStockChecked && outOfStockChecked) {
    // Only out of stock: show products with quantity = 0
    quantityFilter = "filters[quantity][$equals]=0";
  } else {
    // Neither checked: show no products (impossible quantity condition)
    quantityFilter = "filters[quantity][$lt]=0";
  }

  let products = [];
  let totalProducts = 0;

  try {
    // First, get count of all matching products (without pagination)
    const countUrl = `/api/products?filters[price][$lte]=${maxPrice}&filters[rating][$gte]=${
      Number(searchParams?.rating) || 0
    }&${quantityFilter}${
      params?.slug?.length! > 0
        ? `&filters[category][$equals]=${params?.slug}`
        : ""
    }&sort=${searchParams?.sort || 'defaultSort'}&page=1&count=true`;

    // Get paginated products
    const apiUrl = `/api/products?filters[price][$lte]=${maxPrice}&filters[rating][$gte]=${
      Number(searchParams?.rating) || 0
    }&${quantityFilter}${
      params?.slug?.length! > 0
        ? `&filters[category][$equals]=${params?.slug}`
        : ""
    }&sort=${searchParams?.sort || 'defaultSort'}&page=${page}`;
    
    const data = await apiClient.get(apiUrl);

    if (!data.ok) {
      console.error('Failed to fetch products:', data.statusText);
      products = [];
    } else {
      const result = await data.json();
      products = Array.isArray(result) ? result : [];
      
      // Estimate total products based on current results
      // If we got a full page, assume there might be more
      // This is a simple heuristic - ideally backend should return total count
      if (products.length === PRODUCTS_PER_PAGE) {
        totalProducts = page * PRODUCTS_PER_PAGE + PRODUCTS_PER_PAGE; // Assume at least one more page
      } else if (products.length > 0) {
        totalProducts = (page - 1) * PRODUCTS_PER_PAGE + products.length;
      } else if (page > 1) {
        totalProducts = (page - 1) * PRODUCTS_PER_PAGE;
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    products = [];
  }

  return (
    <>
      <PaginationUpdater totalProducts={totalProducts} productsPerPage={PRODUCTS_PER_PAGE} />
      <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
        {products.length > 0 ? (
          products.map((product: any) => (
            <ProductItem key={product.id} product={product} color="black" />
          ))
        ) : (
          <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
            Không tìm thấy sản phẩm phù hợp
          </h3>
        )}
      </div>
    </>
  );
};

export default Products;
