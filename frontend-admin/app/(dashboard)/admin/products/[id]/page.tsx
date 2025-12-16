"use client";
import { CustomButton, SectionTitle } from "@/components";
// Use native <img> for admin preview to avoid Next image optimizer errors in dev
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import { nanoid } from "nanoid";
import apiClient from "@/lib/api";
import { getImageSrc } from "@/utils/imageHelper";

interface DashboardProductDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardProductDetails = ({ params }: DashboardProductDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // functionality for deleting product
  const deleteProduct = async () => {
    const requestOptions = {
      method: "DELETE",
    };
    apiClient
      .delete(`/api/products/${id}`, requestOptions)
      .then((response) => {
        // Backend may return 200 with message or 204 on success depending on code path
        if (response.status === 200 || response.status === 204) {
          toast.success("Product deleted successfully");
          router.push("/admin/products");
        } else if (response.status === 400) {
          toast.error(
            "Cannot delete the product because of foreign key constraint"
          );
        } else {
          throw Error("There was an error while deleting product");
        }
      })
      .catch((error) => {
        toast.error("There was an error while deleting product");
      });
  };

  // functionality for updating product
  const updateProduct = async () => {
    // Robust validation: treat missing/empty values as invalid.
    if (
      !product ||
      !product.title ||
      !product.slug ||
      product.price == null ||
      !product.manufacturer ||
      !product.description
    ) {
      toast.error("You need to enter values in input fields");
      return;
    }

    apiClient
      .put(`/api/products/${id}`, product, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw Error("There was an error while updating product");
        }
      })
      .then((data) => {
        toast.success("Product successfully updated");
        // After updating in admin, go back to admin products list
        router.push("/admin/products");
      })
      .catch((error) => {
        toast.error("There was an error while updating product");
      });
  };

  // functionality for uploading main image file
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
        setProduct((prev) => (prev ? { ...prev, mainImage: data.url } : prev));
        toast.success("Tải ảnh lên thành công!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Upload error:", errorData);
        toast.error(errorData.message || "Lỗi khi tải ảnh lên");
      }
    } catch (error) {
      console.error("There was an error while during request sending:", error);
      toast.error("Lỗi kết nối khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  // fetching main product data including other product images
  const fetchProductData = async () => {
    try {
      const productRes = await apiClient.get(`/api/products/${id}`);
      if (!productRes.ok) throw new Error("Failed to fetch product");
      const productData = await productRes.json();
      setProduct(productData);

      const imagesRes = await apiClient.get(`/api/images/${id}`, {
        cache: "no-store",
      });
      if (!imagesRes.ok) throw new Error("Failed to fetch images");
      const images = await imagesRes.json();
      setOtherImages(images);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể tải dữ liệu sản phẩm");
    }
  };

  // fetching all product categories. It will be used for displaying categories in select category input
  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [id]);

  return (
    <div className="bg-white p-8 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-y-7 w-full">
        <h1 className="text-3xl font-semibold">Product details</h1>
        {/* Product name input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title || ""}
              onChange={(e) =>
                setProduct({ ...product!, title: e.target.value })
              }
            />
          </label>
        </div>
        {/* Slug input */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Slug (URL friendly):</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.slug || ""}
              onChange={(e) =>
                setProduct({ ...product!, slug: e.target.value })
              }
            />
          </label>
        </div>
        {/* Product name input div - end */}
        {/* Product price input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.price || ""}
              onChange={(e) =>
                setProduct({ ...product!, price: Number(e.target.value) })
              }
            />
          </label>
        </div>
        {/* Product price input div - end */}
        {/* Manufacturer input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Manufacturer:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.manufacturer || ""}
              onChange={(e) =>
                setProduct({ ...product!, manufacturer: e.target.value })
              }
            />
          </label>
        </div>
        {/* Manufacturer input div - end */}
        {/* Product inStock select input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.inStock ?? 1}
              onChange={(e) => {
                setProduct({ ...product!, inStock: Number(e.target.value) });
              }}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>
        {/* Product inStock select input div - end */}
        {/* Product quantity input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Số lượng (Quantity):</span>
            </div>
            <input
              type="number"
              min="0"
              placeholder="Nhập số lượng"
              className="input input-bordered w-full max-w-xs"
              value={product?.quantity ?? 0}
              onChange={(e) =>
                setProduct({ ...product!, quantity: Number(e.target.value) })
              }
            />
          </label>
        </div>
        {/* Product quantity input div - end */}
        {/* Product category select input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId || ""}
              onChange={(e) =>
                setProduct({
                  ...product!,
                  categoryId: e.target.value,
                })
              }
            >
              {categories &&
                categories.map((category: Category) => (
                  <option key={category?.id} value={category?.id}>
                    {formatCategoryName(category?.name)}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {/* Product category select input div - end */}

        {/* Main image file upload div - start */}
        <div>
          <label className="form-control w-full max-w-sm">
            <div className="label">
              <span className="label-text">
                Ảnh chính (Upload lên Cloudinary):
              </span>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="file-input file-input-bordered file-input-lg w-full max-w-sm"
              disabled={uploading}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  uploadFile(selectedFile);
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
              <img
                src={getImageSrc(product.mainImage)}
                alt={product?.title || "Product image"}
                className="max-w-[150px] h-auto rounded-lg border"
                loading="lazy"
                onError={(e) => {
                  console.error("Image load error:", product?.mainImage);
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder-image.jpg";
                }}
              />
            </div>
          )}
        </div>
        {/* Main image file upload div - end */}
        {/* Other images file upload div - start */}
        <div className="flex gap-x-1">
          {Array.isArray(otherImages) &&
            otherImages.map((image) => (
              <img
                src={getImageSrc(image.image)}
                key={nanoid()}
                alt="product image"
                className="max-w-[100px] h-auto rounded border"
                loading="lazy"
                onError={(e) => {
                  console.error("Image load error:", image.image);
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder-image.jpg";
                }}
              />
            ))}
        </div>
        {/* Other images file upload div - end */}
        {/* Product description div - start */}
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description || ""}
              onChange={(e) =>
                setProduct({ ...product!, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
        {/* Product description div - end */}
        {/* Action buttons div - start */}
        <div className="flex gap-x-2 max-sm:flex-col">
          <button
            type="button"
            onClick={updateProduct}
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
          >
            Update product
          </button>
          <button
            type="button"
            className="uppercase bg-red-600 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2"
            onClick={deleteProduct}
          >
            Delete product
          </button>
        </div>
        {/* Action buttons div - end */}
        <p className="text-xl max-sm:text-lg text-error">
          To delete the product you first need to delete all its records in
          orders (customer_order_product table).
        </p>
      </div>
    </div>
  );
};

export default DashboardProductDetails;
