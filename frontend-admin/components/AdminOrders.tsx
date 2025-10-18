"use client";

// *********************
// Role of the component: Component that displays all orders on admin dashboard page
// Name of the component: AdminOrders.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <AdminOrders />
// Input parameters: No input parameters
// Output: Table with all orders
// *********************

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      const response = await apiClient.get("/api/orders");
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      console.log('Orders data:', data);

      setOrders(data?.orders || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const currentOrder = orders.find(order => order.id === orderId);
    if (!currentOrder) return;

    // Validate status transition rules
    const currentStatus = currentOrder.status;

    // Define valid transitions
    const validTransitions: { [key: string]: string[] } = {
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['success'],
      'success': [], // Cannot change from success
      'cancelled': [] // Cannot change from cancelled
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      toast.error(`Cannot change status from ${currentStatus} to ${newStatus}`);
      return;
    }

    // Special handling for cancellation
    if (newStatus === 'cancelled') {
      const cancelReasons = [
        'Không đủ hàng tồn kho',
        'Lỗi xử lý hệ thống',
        'Khách hàng yêu cầu hủy',
        'Lỗi thông tin đơn hàng',
        'Giao hàng thất bại - Khách hàng không nhận hàng',
        'Giao hàng thất bại - Lỗi giao hàng',
        'Giao hàng thất bại - Địa chỉ không chính xác'
      ];

      const reasonText = cancelReasons.join(', ');
      const cancelReason = prompt(`Vui lòng chọn lý do hủy đơn:\n\n${reasonText}\n\nHoặc nhập lý do khác:`);

      if (!cancelReason) {
        toast.error('Lý do hủy đơn là bắt buộc');
        return;
      }

      try {
        setUpdatingStatus(orderId);
        const response = await apiClient.put(`/api/orders/${orderId}/status`, {
          status: newStatus,
          cancelReason: cancelReason
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message || "Order cancelled successfully");

          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.id === orderId
                ? { ...order, status: newStatus }
                : order
            )
          );
        } else {
          const errorData = await response.json();
          console.error('Status update error:', errorData);
          toast.error(errorData.error || "There was an error while cancelling order");
        }
      } catch (error) {
        console.error('Status update failed:', error);
        toast.error("There was an error while cancelling order");
      } finally {
        setUpdatingStatus(null);
      }
      return;
    }

    try {
      setUpdatingStatus(orderId);
      const response = await apiClient.put(`/api/orders/${orderId}/status`, {
        status: newStatus
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Order status updated successfully");

        // Update the order in the local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Status update error:', errorData);
        toast.error(errorData.error || "There was an error while updating order status");
      }
    } catch (error) {
      console.error('Status update failed:', error);
      toast.error("There was an error while updating order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="xl:ml-5 w-full max-xl:mt-5 ">
      <h1 className="text-3xl font-semibold text-center mb-5">All orders</h1>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="alert alert-info mb-4">
          <span>No orders found. Create your first order!</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-md table-pin-cols">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {orders && orders.length > 0 &&
              orders.map((order) => (
                <tr key={order?.id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>

                  <td>
                    <div>
                      <p className="font-bold">#{order?.id}</p>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-5">
                      <div>
                        <div className="font-bold">{order?.name}</div>
                        <div className="text-sm opacity-50">{order?.country}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <select
                        className="select  bg-white text-black border border-gray-300"
                        value={order?.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        style={{
                          backgroundColor: order?.status === 'processing' ? '#fbbf24' :
                            order?.status === 'shipped' ? '#3b82f6' :
                              order?.status === 'delivered' ? '#10b981' :
                                order?.status === 'success' ? '#059669' :
                                  order?.status === 'cancelled' ? '#ef4444' : '#ffffff',
                          color: '#000000'
                        }}
                      >
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao hàng</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="success">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      {updatingStatus === order.id && (
                        <span className="loading loading-spinner loading-xs"></span>
                      )}
                    </div>
                  </td>

                  <td>
                    <p>${order?.total}</p>
                  </td>

                  <td>{new Date(Date.parse(order?.dateTime)).toDateString()}</td>
                  <th>
                    <Link
                      href={`/admin/orders/${order?.id}`}
                      className="btn btn-ghost btn-xs"
                    >
                      details
                    </Link>
                  </th>
                </tr>
              ))}
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th></th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>Date</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
