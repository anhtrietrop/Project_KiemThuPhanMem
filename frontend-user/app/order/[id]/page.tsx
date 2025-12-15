"use client";
export const dynamic = "force-dynamic";

import apiClient from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatCurrencyVND } from "@/utils/currency";
import { getImageSrc } from "@/utils/imageHelper";
import { useSession } from "next-auth/react";
import OrderProductReview from "@/components/OrderProductReview";

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

const CustomerOrderDetail = () => {
    const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const { data: session } = useSession();
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
    const [loading, setLoading] = useState(false);
    const params = useParams<{ id: string }>();
    const router = useRouter();

    // Get userId from email
    useEffect(() => {
        const getUserId = async () => {
            if (session?.user?.email) {
                try {
                    const userResponse = await apiClient.get(`/api/users/email/${session.user.email}`);
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        setUserId(userData?.id);
                    }
                } catch {
                    // User not found
                }
            }
        };
        getUserId();
    }, [session?.user?.email]);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/api/orders/${params?.id}`);
                const data: Order = await response.json();
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        const fetchOrderProducts = async () => {
            try {
                const response = await apiClient.get(`/api/order-product/${params?.id}`);
                const data: OrderProduct[] = await response.json();
                setOrderProducts(data);
            } catch (error) {
                console.error('Error fetching order products:', error);
            }
        };

        if (params?.id) {
            fetchOrderData();
            fetchOrderProducts();
        }
    }, [params?.id]);

    const confirmDelivery = async () => {
        if (order.status !== 'delivered') {
            toast.error("Order is not yet delivered");
            return;
        }

        const confirmed = window.confirm("Bạn có chắc chắn đã nhận được hàng?");
        if (!confirmed) return;

        try {
            setLoading(true);
            const response = await apiClient.put(`/api/orders/${order.id}/status`, {
                status: 'success'
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Cảm ơn bạn đã xác nhận nhận hàng!");
                setOrder(prev => ({ ...prev, status: 'success' }));
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to confirm delivery");
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
            toast.error("Failed to confirm delivery");
        } finally {
            setLoading(false);
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

    const getPaymentStatusColor = (paymentStatus?: string) => {
        switch (paymentStatus) {
            case 'PAID': return 'bg-green-100 text-green-800 border-green-300';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'FAILED': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getPaymentStatusText = (paymentStatus?: string) => {
        switch (paymentStatus) {
            case 'PAID': return '✓ Đã thanh toán';
            case 'PENDING': return '⏳ Chờ thanh toán';
            case 'FAILED': return '✗ Thanh toán thất bại';
            default: return '⏳ Chờ thanh toán';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        ← Quay lại trang chủ
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-6">Chi tiết đơn hàng</h1>

                {/* Order Info */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Thông tin đơn hàng</h3>
                            <p><strong>Mã đơn hàng:</strong> #{order?.id}</p>
                            <p><strong>Ngày đặt:</strong> {order?.dateTime ? new Date(order.dateTime).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            <p><strong>Trạng thái:</strong>
                                <span className={`ml-2 px-3 py-1 rounded-full text-white text-sm ${getStatusColor(order?.status)}`}>
                                    {getStatusText(order?.status)}
                                </span>
                            </p>
                            <p className="mt-2">
                                <strong>Thanh toán:</strong>
                                <span className={`ml-2 px-3 py-1 rounded-md text-xs font-semibold border ${getPaymentStatusColor(order?.payment_status)}`}>
                                    {getPaymentStatusText(order?.payment_status)}
                                </span>
                            </p>
                            {order?.payment_status === 'PAID' && (
                                <>
                                    {order?.payment_method && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            <strong>Phương thức:</strong> {order.payment_method}
                                        </p>
                                    )}
                                    {order?.payment_transaction_id && (
                                        <p className="text-sm text-gray-600">
                                            <strong>Mã giao dịch:</strong> {order.payment_transaction_id}
                                        </p>
                                    )}
                                </>
                            )}
                            {order?.cancelReason && (
                                <p className="mt-2"><strong>Lý do hủy:</strong> {order.cancelReason}</p>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Thông tin giao hàng</h3>
                            <p><strong>Người nhận:</strong> {order?.name} {order?.lastname}</p>
                            <p><strong>Số điện thoại:</strong> {order?.phone}</p>
                            <p><strong>Email:</strong> {order?.email}</p>
                            <p><strong>Địa chỉ:</strong> {order?.adress}</p>
                            {order?.apartment && <p><strong>Căn hộ:</strong> {order.apartment}</p>}
                            <p><strong>Thành phố:</strong> {order?.city}</p>
                            {order?.orderNotice && <p><strong>Ghi chú:</strong> {order.orderNotice}</p>}
                        </div>
                    </div>
                </div>

                {/* Products */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">Sản phẩm đã đặt</h3>
                    <div className="space-y-4">
                        {orderProducts?.map((product) => (
                            <div key={product?.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                <Image
                                    src={getImageSrc(product?.product?.mainImage)}
                                    alt={product?.product?.title}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <Link href={`/product/${product?.product?.slug}`} className="font-medium hover:text-blue-600">
                                        {product?.product?.title}
                                    </Link>
                                    <p className="text-gray-600">Số lượng: {product?.quantity}</p>
                                    <p className="text-gray-600">Giá: {formatCurrencyVND(product?.product?.price)}</p>
                                    
                                    {/* Review button for delivered/completed orders */}
                                    {(order?.status === 'delivered' || order?.status === 'success') && userId && (
                                        <OrderProductReview
                                            productId={product?.product?.id}
                                            productTitle={product?.product?.title}
                                            userId={userId}
                                        />
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{formatCurrencyVND(product?.product?.price * product?.quantity)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-4">Tổng kết đơn hàng</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Tạm tính:</span>
                            <span>{formatCurrencyVND(order?.total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Thuế (20%):</span>
                            <span>{formatCurrencyVND(order?.total / 5)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Phí vận chuyển:</span>
                            <span>{formatCurrencyVND(5000)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Tổng cộng:</span>
                            <span>{formatCurrencyVND(order?.total + order?.total / 5 + 5000)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {order?.status === 'delivered' && (
                    <div className="text-center">
                        <button
                            onClick={confirmDelivery}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận đã nhận hàng'}
                        </button>
                        <p className="text-sm text-gray-600 mt-2">
                            Vui lòng xác nhận khi bạn đã nhận được hàng để hoàn tất đơn hàng
                        </p>
                    </div>
                )}

                {order?.status === 'success' && (
                    <div className="text-center bg-green-50 p-6 rounded-lg">
                        <div className="text-green-600 text-lg font-semibold mb-2">
                            ✅ Đơn hàng đã hoàn thành
                        </div>
                        <p className="text-gray-600">
                            Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!
                        </p>
                    </div>
                )}

                {order?.status === 'cancelled' && (
                    <div className="text-center bg-red-50 p-6 rounded-lg">
                        <div className="text-red-600 text-lg font-semibold mb-2">
                            ❌ Đơn hàng đã bị hủy
                        </div>
                        {order?.cancelReason && (
                            <p className="text-gray-600">
                                Lý do hủy: {order.cancelReason}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrderDetail;
