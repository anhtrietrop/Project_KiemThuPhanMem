'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface MomoQRCodeProps {
  qrCodeData: string;
  amount: number;
  orderId: string;
  onClose?: () => void;
}

const MomoQRCode: React.FC<MomoQRCodeProps> = ({
  qrCodeData,
  amount,
  orderId,
  onClose
}) => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate QR code image
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        
        // Using qrcode library (you'll need to install: npm install qrcode @types/qrcode)
        const QRCode = await import('qrcode');
        const qrImage = await QRCode.toDataURL(qrCodeData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeImage(qrImage);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    if (qrCodeData) {
      generateQRCode();
    }
  }, [qrCodeData]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData);
      // You might want to show a toast notification here
      alert('QR code data copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy QR data:', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeImage) return;

    const link = document.createElement('a');
    link.download = `momo-qr-${orderId}.png`;
    link.href = qrCodeImage;
    link.click();
  };

  const refreshQRCode = () => {
    setIsLoading(true);
    setError(null);
    // Trigger QR code regeneration
    const generateQRCode = async () => {
      try {
        const QRCode = await import('qrcode');
        const qrImage = await QRCode.toDataURL(qrCodeData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeImage(qrImage);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <img src="/momo-logo.png" alt="MoMo" className="w-6 h-6" />
          MoMo QR Payment
        </CardTitle>
        <CardDescription>
          Scan with MoMo app to pay {formatAmount(amount)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          {isLoading ? (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : qrCodeImage ? (
            <div className="relative">
              <img 
                src={qrCodeImage} 
                alt="MoMo QR Code" 
                className="w-64 h-64 border rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <img src="/momo-logo.png" alt="MoMo" className="w-8 h-8" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">QR Code not available</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to pay:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Open MoMo app on your phone</li>
            <li>2. Tap "Scan QR" or camera icon</li>
            <li>3. Point camera at the QR code above</li>
            <li>4. Confirm payment details</li>
            <li>5. Enter your MoMo PIN to complete</li>
          </ol>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <p><strong>Order ID:</strong> #{orderId}</p>
          <p><strong>Amount:</strong> {formatAmount(amount)}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyQRData}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Data
          </Button>
          
          {qrCodeImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshQRCode}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-center">
            <strong>Important:</strong> This QR code will expire in 15 minutes. 
            Please complete your payment before then.
          </AlertDescription>
        </Alert>

        {onClose && (
          <div className="text-center">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MomoQRCode;
