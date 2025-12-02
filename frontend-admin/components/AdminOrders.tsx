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

const CANCEL_REASONS = [
  'Không đủ hàng tồn kho',
  'Lỗi xử lý hệ thống',
  'Khách hàng yêu cầu hủy',
  'Lỗi thông tin đơn hàng',
  'Giao hàng thất bại - Khách hàng không nhận hàng',
  'Giao hàng thất bại - Lỗi giao hàng',
  'Giao hàng thất bại - Địa chỉ không chính xác',
  'Khác'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ orderId: string; isOpen: boolean } | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

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

    // Special handling for cancellation - open modal
    if (newStatus === 'cancelled') {
      setCancelModal({ orderId, isOpen: true });
      setSelectedReason('');
      setCustomReason('');
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
              ? { ...order, status: newStatus as "processing" | "shipped" | "delivered" | "cancelled" }
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

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;

    const reason = selectedReason === 'Khác' ? customReason : selectedReason;

    if (!reason.trim()) {
      toast.error('Vui lòng chọn hoặc nhập lý do hủy đơn');
      return;
    }

    try {
      setUpdatingStatus(cancelModal.orderId);
      const response = await apiClient.put(`/api/orders/${cancelModal.orderId}/status`, {
        status: 'cancelled',
        cancelReason: reason
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Đã hủy đơn hàng thành công");

        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === cancelModal.orderId
              ? { ...order, status: 'cancelled', cancelReason: reason }
              : order
          )
        );
        setCancelModal(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Có lỗi khi hủy đơn hàng");
      }
    } catch (error) {
      console.error('Cancel order failed:', error);
      toast.error("Có lỗi khi hủy đơn hàng");
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
                  <input type="checkbox" className="checkbox" aria-label="Select order" />
                </label>
              </th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th className="min-w-[160px]">Order Status</th>
              <th className="min-w-[150px]">Payment Status</th>
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
                      <input type="checkbox" className="checkbox" aria-label="Select order" />
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
                        <div className="text-sm opacity-50">{order?.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                  <div className="flex items-center">
                    {/* Thêm w-full và max-w-full để select tận dụng hết khoảng trống của cột */}
                    <select
                      className="select select-sm select-bordered w-full font-medium" 
                      value={order?.status}
                      title="Order Status"
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                      style={{
                        // Giữ logic màu cũ của bạn
                        backgroundColor: order?.status === 'processing' ? '#fbbf24' :
                          order?.status === 'shipped' ? '#3b82f6' :
                            order?.status === 'delivered' ? '#10b981' :
                              order?.status === 'success' ? '#22c55e' :
                                order?.status === 'cancelled' ? '#ef4444' : '#ffffff',
                        color: order?.status === 'cancelled' || order?.status === 'shipped' || order?.status === 'delivered' || order?.status === 'success' ? '#ffffff' : '#000000',
                        // Thêm background image none nếu muốn bỏ mũi tên mặc định để tiết kiệm chỗ (tuỳ chọn)
                      }}
                    >
                      <option value="processing">Đang xử lý</option>
                      <option value="shipped">Đang giao hàng</option>
                      <option value="delivered">Đã giao hàng</option>
                      <option value="success">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                    {updatingStatus === order.id && (
                      <span className="loading loading-spinner loading-xs ml-2"></span>
                    )}
                  </div>
                </td>

                 <td>
  {order?.payment_status ? (
    <div 
      // whitespace-nowrap: Chống xuống dòng
      // h-auto & py-1: Đảm bảo badge tự giãn chiều cao nếu cần thiết mà không bị cắt chữ
      className="badge badge-sm text-white font-semibold whitespace-nowrap h-auto py-1 px-3"
      style={{
        backgroundColor: order?.payment_status === 'PAID' ? '#10b981' :
          order?.payment_status === 'PENDING' ? '#f59e0b' :
            order?.payment_status === 'FAILED' ? '#ef4444' : '#6b7280',
        border: 'none'
      }}
    >
      {/* Thêm gap để icon và text không dính nhau */}
      <span className="flex items-center gap-1">
        {order?.payment_status === 'PAID' ? '✅ Đã thanh toán' :
          order?.payment_status === 'PENDING' ? '⏳ Chờ thanh toán' :
            order?.payment_status === 'FAILED' ? '❌ Thất bại' : order?.payment_status}
      </span>
    </div>
  ) : (
    <span className="text-gray-400 text-xs italic">Chưa có thông tin</span>
  )}
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
              <th>Order Status</th>
              <th>Payment Status</th>
              <th>Subtotal</th>
              <th>Date</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cancel Order Modal */}
      {cancelModal?.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Hủy đơn hàng</h3>
            <p className="text-gray-600 mb-4">Vui lòng chọn lý do hủy đơn hàng:</p>

            <div className="space-y-2 mb-4">
              {CANCEL_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="radio radio-error"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Khác' && (
              <div className="mb-4">
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Nhập lý do hủy đơn..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setCancelModal(null)}
                disabled={updatingStatus === cancelModal.orderId}
              >
                Hủy bỏ
              </button>
              <button
                className="btn btn-error"
                onClick={handleConfirmCancel}
                disabled={updatingStatus === cancelModal.orderId || !selectedReason}
              >
                {updatingStatus === cancelModal.orderId ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Xác nhận hủy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
