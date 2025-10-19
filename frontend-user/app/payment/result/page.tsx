'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

interface PaymentResult {
  success: boolean;
  orderId: string;
  amount: number;
  transId?: string;
  message: string;
  resultCode: number;
}

const PaymentResultPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract parameters from URL
  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message');
  const transId = searchParams.get('transId');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        // Check payment status from backend
        const response = await fetch(`/api/payments/momo/status/${orderId}`);
        const result = await response.json();

        if (result.success) {
          setPaymentResult({
            success: result.data.status === 'SUCCESS',
            orderId: result.data.orderId,
            amount: result.data.amount,
            transId: result.data.transId,
            message: result.data.message,
            resultCode: result.data.resultCode
          });
        } else {
          // Fallback to URL parameters
          setPaymentResult({
            success: resultCode === '0',
            orderId: orderId,
            amount: 0,
            transId: transId || undefined,
            message: message || 'Payment status unknown',
            resultCode: parseInt(resultCode || '99')
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Fallback to URL parameters
        setPaymentResult({
          success: resultCode === '0',
          orderId: orderId,
          amount: 0,
          transId: transId || undefined,
          message: message || 'Payment status unknown',
          resultCode: parseInt(resultCode || '99')
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId, resultCode, message, transId]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusIcon = () => {
    if (!paymentResult) return <Clock className="w-8 h-8 text-yellow-600" />;
    
    if (paymentResult.success) {
      return <CheckCircle className="w-8 h-8 text-green-600" />;
    } else {
      return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (!paymentResult) return 'yellow';
    return paymentResult.success ? 'green' : 'red';
  };

  const getStatusTitle = () => {
    if (!paymentResult) return 'Checking Payment Status...';
    return paymentResult.success ? 'Payment Successful!' : 'Payment Failed';
  };

  const getStatusMessage = () => {
    if (!paymentResult) return 'Please wait while we verify your payment...';
    
    if (paymentResult.success) {
      return `Your payment has been processed successfully. Transaction ID: ${paymentResult.transId}`;
    } else {
      return paymentResult.message || 'Your payment could not be processed. Please try again or contact support.';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
            </div>
            <CardTitle>Checking Payment Status...</CardTitle>
            <CardDescription>
              Please wait while we verify your payment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 bg-${getStatusColor()}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-${getStatusColor()}-600`}>
            {getStatusTitle()}
          </CardTitle>
          <CardDescription>
            {getStatusMessage()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {paymentResult && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">#{paymentResult.orderId}</span>
              </div>
              
              {paymentResult.amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatAmount(paymentResult.amount)}</span>
                </div>
              )}
              
              {paymentResult.transId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">{paymentResult.transId}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status Code:</span>
                <span className="font-medium">{paymentResult.resultCode}</span>
              </div>
            </div>
          )}

          {paymentResult?.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your order has been confirmed and will be processed shortly. You will receive an email confirmation.
              </AlertDescription>
            </Alert>
          )}

          {paymentResult && !paymentResult.success && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                If you believe this is an error, please contact our customer support with the transaction details above.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            {paymentResult?.success ? (
              <>
                <Button 
                  onClick={() => router.push('/my-orders')}
                  className="w-full"
                >
                  View My Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => router.push(`/order/${paymentResult?.orderId}`)}
                  className="w-full"
                >
                  Try Payment Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/cart')}
                  className="w-full"
                >
                  Back to Cart
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/')}
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentResultPage;
