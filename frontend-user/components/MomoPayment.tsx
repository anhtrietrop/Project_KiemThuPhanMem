'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Smartphone, QrCode, ExternalLink } from 'lucide-react';
import config from '@/lib/config';
import { formatCurrencyVND } from "@/utils/currency";
import Image from 'next/image';

interface MomoPaymentProps {
  orderId: string;
  amount: number;
  orderInfo: string;
  onSuccess?: (result: PaymentResponse['data']) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

interface PaymentResponse {
  success: boolean;
  data: {
    payUrl: string;
    deeplink: string;
    qrCodeUrl: string;
    resultCode: number;
    message: string;
    status?: string;
  };
}

const MomoPayment: React.FC<MomoPaymentProps> = ({
  orderId,
  amount,
  orderInfo,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Format amount for display
  const formatAmount = (amount: number) => formatCurrencyVND(amount);

  // Create MoMo payment request
  const createPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/momo/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          orderInfo,
          extraData: {
            source: 'web',
            timestamp: Date.now()
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create payment');
      }

      if (result.success) {
        setPaymentData(result);
        setPaymentStatus('processing');
      } else {
        throw new Error(result.data?.message || 'Payment creation failed');
      }
    } catch (err: any) {
      setError(err.message);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = React.useCallback(async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/payments/momo/status/${orderId}`);
      const result = await response.json();

      if (result.success) {
        const status = result.data.status;
        if (status === 'SUCCESS') {
          setPaymentStatus('success');
          onSuccess?.(result.data);
        } else if (status === 'FAILED') {
          setPaymentStatus('failed');
          setError(result.data.message || 'Payment failed');
          onError?.(result.data);
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  }, [orderId, onSuccess, onError]);

  // Poll payment status when processing
  useEffect(() => {
    if (paymentStatus === 'processing') {
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [paymentStatus, checkPaymentStatus]);

  // Handle payment method selection
  const handlePaymentMethod = (method: 'web' | 'app' | 'qr') => {
    if (!paymentData?.data) return;

    switch (method) {
      case 'web':
        window.open(paymentData.data.payUrl, '_blank');
        break;
      case 'app':
        if (paymentData.data.deeplink) {
          window.location.href = paymentData.data.deeplink;
        }
        break;
      case 'qr':
        // QR code will be displayed in the component
        break;
    }
  };

  // Generate QR code (you'll need to install qrcode library: npm install qrcode @types/qrcode)
  const generateQRCode = async (data: string) => {
    try {
      const QRCode = await import('qrcode');
      return await QRCode.toDataURL(data);
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-green-600">Thanh toán thành công!</CardTitle>
          <CardDescription>
            Thanh toán {formatAmount(amount)} đã được xử lý thành công.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <CardTitle className="text-red-600">Thanh toán thất bại</CardTitle>
          <CardDescription>
            {error || 'Thanh toán không thành công. Vui lòng thử lại.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => {
            setPaymentStatus('idle');
            setError(null);
            setPaymentData(null);
          }}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image src="/momo-logo.png" alt="MoMo" width={32} height={32} className="w-8 h-8" />
          Thanh toán MoMo
        </CardTitle>
        <CardDescription>
          Thanh toán {formatAmount(amount)} cho đơn hàng #{orderId}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!paymentData ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p><strong>Đơn hàng:</strong> {orderInfo}</p>
              <p><strong>Số tiền:</strong> {formatAmount(amount)}</p>
            </div>

            <Button
              onClick={createPayment}
              disabled={isLoading}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo yêu cầu thanh toán...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Thanh toán với MoMo
                </>
              )}
            </Button>

            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="w-full">
                Hủy
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              Chọn phương thức thanh toán:
            </div>

            <div className="grid gap-3">
              <Button
                onClick={() => handlePaymentMethod('web')}
                variant="outline"
                className="flex items-center justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Trình duyệt web</div>
                    <div className="text-sm text-gray-500">Thanh toán ở tab mới</div>
                  </div>
                </div>
              </Button>

              {paymentData.data.deeplink && (
                <Button
                  onClick={() => handlePaymentMethod('app')}
                  variant="outline"
                  className="flex items-center justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Ứng dụng MoMo</div>
                      <div className="text-sm text-gray-500">Mở ứng dụng MoMo</div>
                    </div>

                  </div>
                </Button>
              )}

              {paymentData.data.qrCodeUrl && (
                <Button
                  onClick={() => handlePaymentMethod('qr')}
                  variant="outline"
                  className="flex items-center justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Mã QR</div>
                      <div className="text-sm text-gray-500">Quét bằng ứng dụng MoMo</div>
                    </div>
                  </div>
                </Button>
              )}
            </div>

            {paymentStatus === 'processing' && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Đang chờ xác nhận thanh toán... Vui lòng hoàn tất trong ứng dụng MoMo.
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                Hủy thanh toán
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MomoPayment;

