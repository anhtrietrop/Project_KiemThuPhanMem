"use client";
import { CustomButton, DashboardSidebar, SectionTitle, Loader } from "@/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import { nanoid } from "nanoid";
import apiClient from "@/lib/api";

interface DashboardProductDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardProductDetails = ({
  params,
}: DashboardProductDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const router = useRouter();

  // functionality for deleting product
  const deleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/products/${id}`);

      if (response.status === 204) {
        toast.success("Product deleted successfully");
        router.push("/admin/products");
      } else if (response.status === 400) {
        toast.error("Cannot delete the product because of foreign key constraint");
      } else {
        throw new Error("There was an error while deleting product");
      }
    } catch (error) {
      toast.error("There was an error while deleting product");
    }
  };

  // functionality for updating product
  const updateProduct = async () => {
    if (
      !product?.title ||
      !product?.slug ||
      !product?.price ||
      !product?.manufacturer ||
      !product?.description ||
      !product?.categoryId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Calculate inStock based on quantity
      const inStock = (product.quantity || 0) > 0 ? 1 : 0;

      const updatedProduct = {
        ...product,
        inStock,
      };

      const response = await apiClient.put(`/api/products/${id}`, updatedProduct, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.status === 200) {
        toast.success("Product successfully updated");
      } else {
        throw new Error("There was an error while updating product");
      }
    } catch (error) {
      toast.error("There was an error while updating product");
    } finally {
      setLoading(false);
    }
  };

  // functionality for uploading main image file
  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProduct({ ...product!, mainImage: data.filename || file.name });
        setImagePreview(URL.createObjectURL(file));
        toast.success("Image uploaded successfully");
      } else {
        toast.error("File upload unsuccessful.");
      }
    } catch (error) {
      console.error("There was an error while during request sending:", error);
      toast.error("There was an error during request sending");
    }
  };

  // fetching main product data including other product images
  const fetchProductData = async () => {
    try {
      const res = await apiClient.get(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
      setImagePreview(data?.mainImage ? `/${data.mainImage}` : "");
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product data");
    }

    try {
      const imagesData = await apiClient.get(`/api/images/${id}`, {
        cache: "no-store",
      });
      const images = await imagesData.json();
      setOtherImages(images || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // fetching all product categories
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get(`/api/categories`);
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [id]);

  if (!product) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
        <DashboardSidebar />

        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Product</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={product.title || ""}
                    onChange={(e) => setProduct({ ...product, title: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                    value={product.description || ""}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={product.categoryId || ""}
                    onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories?.map((category: Category) => (
                      <option key={category?.id} value={category?.id}>
                        {formatCategoryName(category?.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={product.price || ""}
                      onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Units In Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={product.quantity || 0}
                      onChange={(e) => setProduct({ ...product, quantity: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={product.manufacturer || ""}
                      onChange={(e) => setProduct({ ...product, manufacturer: e.target.value })}
                      placeholder="Enter manufacturer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expire Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={product.expireDate || ""}
                      onChange={(e) => setProduct({ ...product, expireDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Slug
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={product.slug ? convertSlugToURLFriendly(product.slug) : ""}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        slug: convertSlugToURLFriendly(e.target.value),
                      })
                    }
                    placeholder="product-slug"
                  />
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <Image
                          src={imagePreview}
                          alt="Product preview"
                          width={300}
                          height={300}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <div className="space-y-2">
                          <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            accept="image/*"
                            onChange={(e: any) => {
                              if (e.target.files[0]) {
                                uploadFile(e.target.files[0]);
                              }
                            }}
                          />
                          <label
                            htmlFor="file-upload"
                            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                          >
                            CHANGE IMAGE NOW
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setProduct({ ...product, mainImage: "" });
                            }}
                            className="block mx-auto text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-gray-400">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Upload Product Image
                            </span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e: any) => {
                                if (e.target.files[0]) {
                                  uploadFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Status Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Stock Status</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${(product.quantity || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {(product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'} ({product.quantity || 0} units)
                    </span>
                  </div>
                </div>

                {/* Other Images */}
                {otherImages && otherImages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Other Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {otherImages.map((image) => (
                        <Image
                          src={`/${image.image}`}
                          key={nanoid()}
                          alt="product image"
                          width={100}
                          height={100}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={updateProduct}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 min-w-[200px]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "UPDATE NOW"
                )}
              </button>

              <button
                onClick={deleteProduct}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 min-w-[200px]"
              >
                DELETE PRODUCT
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                To delete the product you first need to delete all its records in orders (customer_order_product table).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProductDetails;