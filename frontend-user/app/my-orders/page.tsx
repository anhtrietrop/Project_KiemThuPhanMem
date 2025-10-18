"use client";
import apiClient from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

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

const MyOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmingOrder, setConfirmingOrder] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            toast.error("Vui lòng đăng nhập để xem đơn hàng");
            router.replace("/login?callbackUrl=/my-orders");
        }
    }, [status, router]);

    const fetchOrders = async () => {
        if (!session?.user?.email) return;

        try {
            setLoading(true);
            const response = await apiClient.get("/api/orders");

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status}`);
            }

            const data = await response.json();
            // Filter orders by current user's email
            const userOrders = data?.orders?.filter((order: Order) =>
                order.email === session.user.email
            ) || [];

            setOrders(userOrders);
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.email) {
            fetchOrders();
        }
    }, [session?.user?.email]);

    const confirmDelivery = async (orderId: string) => {
        const confirmed = window.confirm("Bạn có chắc chắn đã nhận được hàng?");
        if (!confirmed) return;

        try {
            setConfirmingOrder(orderId);
            const response = await apiClient.put(`/api/orders/${orderId}/status`, {
                status: 'success'
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Cảm ơn bạn đã xác nhận nhận hàng!");

                // Update the order in the local state
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status: 'success' }
                            : order
                    )
                );
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to confirm delivery");
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
            toast.error("Failed to confirm delivery");
        } finally {
            setConfirmingOrder(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'processing': return 'bg-yellow-500';
            case 'shipped': return 'bg-blue-500';
            case 'delivered': return 'bg-green-500';
            case 'success': return 'bg-emerald-600';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'processing': return 'Đang xử lý';
            case 'shipped': return 'Chờ giao hàng';
            case 'delivered': return 'Đã giao hàng';
            case 'success': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    if (status === "unauthenticated") {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        ← Quay lại trang chủ
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>

                {error && (
                    <div className="alert alert-error mb-4">
                        <span>Lỗi: {error}</span>
                    </div>
                )}

                {orders.length === 0 && !loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">
                            Bạn chưa có đơn hàng nào
                        </div>
                        <Link
                            href="/shop"
                            className="btn btn-primary"
                        >
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="border rounded-lg p-6 bg-gray-50">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Đơn hàng #{order.id.slice(0, 8)}...
                                        </h3>
                                        <p className="text-gray-600">
                                            Ngày đặt: {order.dateTime ? new Date(order.dateTime).toLocaleDateString('vi-VN') : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        <p className="text-lg font-semibold mt-2">
                                            ${order.total + order.total / 5 + 5}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Thông tin giao hàng</h4>
                                        <p className="text-sm text-gray-600">
                                            <strong>Người nhận:</strong> {order.name} {order.lastname}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Địa chỉ:</strong> {order.adress}, {order.city}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>SĐT:</strong> {order.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Chi tiết đơn hàng</h4>
                                        <p className="text-sm text-gray-600">
                                            <strong>Tạm tính:</strong> ${order.total}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Thuế:</strong> ${order.total / 5}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Phí ship:</strong> $5
                                        </p>
                                    </div>
                                </div>

                                {/* Cancel Reason */}
                                {order.cancelReason && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                                        <p className="text-sm text-red-700">
                                            <strong>Lý do hủy:</strong> {order.cancelReason}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center">
                                    <Link
                                        href={`/order/${order.id}`}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Xem chi tiết
                                    </Link>

                                    {order.status === 'delivered' && (
                                        <button
                                            onClick={() => confirmDelivery(order.id)}
                                            disabled={confirmingOrder === order.id}
                                            className="btn btn-success btn-sm"
                                        >
                                            {confirmingOrder === order.id ? (
                                                <>
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                'Xác nhận đã nhận hàng'
                                            )}
                                        </button>
                                    )}

                                    {order.status === 'success' && (
                                        <div className="text-green-600 text-sm font-semibold">
                                            ✅ Đã hoàn thành
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
