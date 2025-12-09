"use client";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import { getImageSrc } from "@/utils/imageHelper";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddNewProduct = () => {
  const [product, setProduct] = useState<{
    merchantId?: string;
    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    quantity: number;
    mainImage: string;
    description: string;
    categoryId: string;
  }>({
    merchantId: "",
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    quantity: 0,
    mainImage: "",
    description: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [uploading, setUploading] = useState(false);

  const addProduct = async () => {
    if (
      !product.merchantId ||
      product.title === "" ||
      product.description == ""
    ) {
      toast.error("Please enter values in input fields");
      return;
    }

    try {
      // Sanitize form data before sending to API
      const sanitizedProduct = sanitizeFormData(product);

      console.log("Sending product data:", sanitizedProduct);

      // Correct usage of apiClient.post
      const response = await apiClient.post(`/api/products`, sanitizedProduct);

      if (response.status === 201) {
        const data = await response.json();
        console.log("Product created successfully:", data);
        toast.success("Product added successfully");
        setProduct({
          merchantId: "",
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          quantity: 0,
          mainImage: "",
          description: "",
          categoryId: categories[0]?.id || "",
        });
      } else {
        const errorData = await response.json();
        console.error("Failed to create product:", errorData);
        toast.error(`"Error:" ${errorData.message || "Failed to add product"}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const fetchMerchants = async () => {
    try {
      const res = await apiClient.get("/api/merchants");
      const data: Merchant[] = await res.json();
      setMerchants(data || []);
      setProduct((prev) => ({
        ...prev,
        merchantId: prev.merchantId || data?.[0]?.id || "",
      }));
    } catch (e) {
      toast.error("Failed to load merchants");
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);
    setUploading(true);

    try {
      const response = await apiClient.postFormData(
        "/api/main-image",
        formData
      );

      if (response.ok) {
        const data = await response.json();
        // Lưu Cloudinary URL thay vì tên file
        setProduct((prev) => ({ ...prev, mainImage: data.url }));
        toast.success("Tải ảnh lên thành công!");
      } else {
        const errorData = await response.json();
        console.error("File upload unsuccessful:", errorData);
        toast.error(errorData.message || "Lỗi khi tải ảnh lên");
      }
    } catch (error) {
      console.error("Error happened while sending request:", error);
      toast.error("Lỗi kết nối khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setProduct({
          merchantId: product.merchantId || "",
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          quantity: 0,
          mainImage: "",
          description: "",
          categoryId: data[0]?.id,
        });
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchMerchants();
  }, []);

  return (
    <div className="bg-white p-8 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-y-7 w-full">
        <h1 className="text-3xl font-semibold">Add new product</h1>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Merchant Info:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.merchantId}
              onChange={(e) =>
                setProduct({ ...product, merchantId: e.target.value })
              }
            >
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
            {merchants.length === 0 && (
              <span className="text-xs text-red-500 mt-1">
                Please create a merchant first.
              </span>
            )}
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title}
              onChange={(e) =>
                setProduct({ ...product, title: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId}
              onChange={(e) =>
                setProduct({ ...product, categoryId: e.target.value })
              }
            >
              {categories &&
                categories.map((category: any) => (
                  <option key={category?.id} value={category?.id}>
                    {category?.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.price}
              onChange={(e) =>
                setProduct({ ...product, price: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.inStock}
              onChange={(e) =>
                setProduct({ ...product, inStock: Number(e.target.value) })
              }
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Số lượng (Quantity)</span>
            </div>
            <input
              type="number"
              min="0"
              placeholder="Nhập số lượng sản phẩm"
              className="input input-bordered w-full"
              value={product?.quantity || 0}
              onChange={(e) =>
                setProduct({ ...product, quantity: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-sm">
            <div className="label">
              <span className="label-text">
                Ảnh sản phẩm (Upload lên Cloudinary):
              </span>
            </div>
            <input
              aria-label="img"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="file-input file-input-bordered file-input-lg w-full"
              disabled={uploading}
              onChange={(e: any) => {
                if (e.target.files?.[0]) {
                  uploadFile(e.target.files[0]);
                }
              }}
            />
            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-blue-600">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Đang tải ảnh lên Cloudinary...</span>
              </div>
            )}
          </label>
          {product?.mainImage && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">Xem trước:</p>
              <Image
                src={getImageSrc(product.mainImage)}
                alt={product?.title || "Product preview"}
                className="w-auto h-auto rounded-lg border"
                width={150}
                height={150}
              />
            </div>
          )}
        </div>
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
        <div className="flex gap-x-2">
          <button
            onClick={addProduct}
            type="button"
            disabled={uploading}
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
          >
            Add product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
