"use client";
import apiClient from "@/lib/api";
import { isValidEmailAddressFormat, isValidNameOrLastname } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { formatCurrencyVND } from "@/utils/currency";
import toast from "react-hot-toast";

// 1. Đã thêm Interface OrderProduct
interface OrderProduct {
  id: string;
  customerOrderId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    title: string;
    mainImage: string;
    price: number;
    rating: number;
    description: string;
    manufacturer: string;
    inStock: number;
    categoryId: string;
  };
}

// 2. Đã thêm Interface Order (Sửa lỗi thiếu định nghĩa)
interface Order {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  adress: string; // Giữ nguyên theo code cũ của bạn (nên check lại API xem có phải address không)
  apartment: string;
  city: string;
  status: string;
  total: number;
  dateTime: string;
  orderNotice?: string;
  payment_status?: string;
  payment_method?: string;
  payment_transaction_id?: string;
}

const AdminSingleOrder = () => {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>();
  
  const [order, setOrder] = useState<Order>({
    id: "",
    adress: "",
    apartment: "",
    dateTime: "",
    email: "",
    lastname: "",
    name: "",
    phone: "",
    city: "",
    orderNotice: "",
    status: "processing",
    total: 0,
  });

  // 3. Sửa useParams cho đúng chuẩn TypeScript Next.js
  const params = useParams(); 
  const router = useRouter();
  // Lấy id an toàn
  const orderId = params?.id?.toString();

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderData = async () => {
      // Sửa params?.id thành orderId
      const response = await apiClient.get(`/api/orders/${orderId}`);
      const data: Order = await response.json();
      setOrder(data);
    };

    const fetchOrderProducts = async () => {
      const response = await apiClient.get(`/api/order-product/${orderId}`);
      const data: OrderProduct[] = await response.json();
      setOrderProducts(data);
    };

    fetchOrderData();
    fetchOrderProducts();
  }, [orderId]);

  const updateOrder = async () => {
    // Kiểm tra order tồn tại trước khi check length
    if (!order) return;

    if (
      order.name.length > 0 &&
      order.lastname.length > 0 &&
      order.phone.length > 0 &&
      order.email.length > 0 &&
      order.adress.length > 0 &&
      order.city.length > 0
    ) {
      if (!isValidNameOrLastname(order.name)) {
        toast.error("You entered invalid name format");
        return;
      }

      if (!isValidNameOrLastname(order.lastname)) {
        toast.error("You entered invalid lastname format");
        return;
      }

      if (!isValidEmailAddressFormat(order.email)) {
        toast.error("You entered invalid email format");
        return;
      }

      if (!/^[a-zA-ZÀ-ÿ\s\-'\.0-9]+$/.test(order.city)) {
        toast.error("You entered invalid city format");
        return;
      }

      apiClient
        .put(`/api/orders/${order.id}`, order)
        .then((response) => {
          if (response.ok) {
            toast.success("Order updated successfully");
          } else {
            return response.json().then((data) => {
              console.error("Update error:", data);
              if (data.details && Array.isArray(data.details)) {
                data.details.forEach(
                  (error: { field: string; message: string }) => {
                    toast.error(`${error.field}: ${error.message}`);
                  }
                );
              } else {
                toast.error(
                  data.error || "There was an error while updating order"
                );
              }
            });
          }
        })
        .catch((error) => {
          console.error("Update failed:", error);
          toast.error("There was an error while updating order");
        });
    } else {
      toast.error("Please fill all fields");
    }
  };

  const updateOrderStatus = async () => {
    if (!order) return;
    const statusUpdate = {
      status: order.status,
    };

    try {
      const response = await apiClient.put(
        `/api/orders/${order.id}/status`,
        statusUpdate
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Order status updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Status update error:", errorData);
        toast.error(
          errorData.error || "There was an error while updating order status"
        );
      }
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("There was an error while updating order status");
    }
  };

  // 4. Refactor deleteOrder sang async/await thuần túy
  const deleteOrder = async () => {
    if (!order) return;
    
    const requestOptions = {
      method: "DELETE",
    };

    try {
        await apiClient.delete(`/api/order-product/${order.id}`, requestOptions);
        await apiClient.delete(`/api/orders/${order.id}`, requestOptions);
        
        toast.success("Order deleted successfully");
        router.push("/admin/orders");
    } catch (error) {
        console.error(error);
        toast.error("Failed to delete order");
    }
  };

  return (
    <div className="bg-white p-8 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-y-7 w-full">
        <h1 className="text-3xl font-semibold">Order details</h1>
        <div className="mt-5">
          <label className="w-full">
            <div>
              <span className="text-xl font-bold">Order ID:</span>
              <span className="text-base"> {order?.id}</span>
            </div>
          </label>
        </div>
        
        {/* FORM INPUTS - GIỮ NGUYÊN */}
        <div className="flex gap-x-2 max-sm:flex-col">
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Name:</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order?.name || ""}
                onChange={(e) => setOrder({ ...order!, name: e.target.value })}
              />
            </label>
          </div>
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Lastname:</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order?.lastname || ""}
                onChange={(e) =>
                  setOrder({ ...order!, lastname: e.target.value })
                }
              />
            </label>
          </div>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Phone number:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={order?.phone || ""}
              onChange={(e) => setOrder({ ...order!, phone: e.target.value })}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Email adress:</span>
            </div>
            <input
              type="email"
              className="input input-bordered w-full max-w-xs"
              value={order?.email || ""}
              onChange={(e) => setOrder({ ...order!, email: e.target.value })}
            />
          </label>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col">
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Address:</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order?.adress || ""}
                onChange={(e) => setOrder({ ...order!, adress: e.target.value })}
              />
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">
                  Apartment, suite, etc. (optional):
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order?.apartment || ""}
                onChange={(e) =>
                  setOrder({ ...order!, apartment: e.target.value })
                }
              />
            </label>
          </div>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">City:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={order?.city || ""}
              onChange={(e) => setOrder({ ...order!, city: e.target.value })}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Order status</span>
            </div>
            <select
              className="select select-bordered"
              value={order?.status || "processing"}
              onChange={(e) =>
                setOrder({
                  ...order!,
                  status: e.target.value,
                })
              }
            >
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="success">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </label>
        </div>

        {/* Payment Information */}
        {order?.payment_status && (
          <div className="card bg-base-100 shadow-md p-4">
            <h3 className="font-bold text-lg mb-2">Thông tin thanh toán</h3>
            <div className="flex flex-col gap-2">
              <div>
                <span className="font-semibold">Trạng thái: </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor:
                      order?.payment_status === "PAID"
                        ? "#10b981"
                        : order?.payment_status === "PENDING"
                        ? "#f59e0b"
                        : order?.payment_status === "FAILED"
                        ? "#ef4444"
                        : "#6b7280",
                    color: "#ffffff",
                    border: "none",
                  }}
                >
                  {order?.payment_status === "PAID"
                    ? "✅ Đã thanh toán"
                    : order?.payment_status === "PENDING"
                    ? "⏳ Chờ thanh toán"
                    : order?.payment_status === "FAILED"
                    ? "❌ Thanh toán thất bại"
                    : order?.payment_status}
                </span>
              </div>
              {order?.payment_method && (
                <div>
                  <span className="font-semibold">Phương thức: </span>
                  <span className="badge badge-outline">
                    {order?.payment_method}
                  </span>
                </div>
              )}
              {order?.payment_transaction_id && (
                <div>
                  <span className="font-semibold">Mã giao dịch: </span>
                  <span className="font-mono text-sm">
                    {order?.payment_transaction_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <div>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Order notice:</span>
              </div>
              <textarea
                className="textarea textarea-bordered h-24"
                value={order?.orderNotice || ""}
                onChange={(e) =>
                  setOrder({ ...order!, orderNotice: e.target.value })
                }
              ></textarea>
            </label>
          </div>
          <div>
            {orderProducts?.map((product) => (
              <div className="flex items-center gap-x-4" key={product?.id}>
                <Image
                  src={
                    product?.product?.mainImage
                      ? `/${product?.product?.mainImage}`
                      : "/product_placeholder.jpg"
                  }
                  alt={product?.product?.title}
                  width={50}
                  height={50}
                  className="w-auto h-auto"
                />
                <div>
                  <Link href={`/product/${product?.product?.slug}`}>
                    {product?.product?.title}
                  </Link>
                  <p>
                    {formatCurrencyVND(product?.product?.price)} × {product?.quantity} sản phẩm
                  </p>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-y-2 mt-10">
              <p className="text-2xl">Tạm tính: {formatCurrencyVND(order?.total)}</p>
              <p className="text-2xl">Thuế 20%: {formatCurrencyVND(order ? order.total / 5 : 0)}</p>
              <p className="text-2xl">Vận chuyển: {formatCurrencyVND(5000)}</p>
              <p className="text-3xl font-semibold">
                Tổng cộng: {formatCurrencyVND(order ? order.total + order.total / 5 + 5000 : 0)}
              </p>
            </div>
            <div className="flex gap-x-2 max-sm:flex-col mt-5">
              <button
                type="button"
                className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
                onClick={updateOrder}
              >
                Update customer info
              </button>
              <button
                type="button"
                className="uppercase bg-green-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2"
                onClick={updateOrderStatus}
              >
                Update status only
              </button>
              <button
                type="button"
                className="uppercase bg-red-600 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2"
                onClick={deleteOrder}
              >
                Delete order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSingleOrder;