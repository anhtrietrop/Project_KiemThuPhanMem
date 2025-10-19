# MoMo Payment Gateway Integration Guide

This guide provides complete instructions for integrating MoMo's One-Time Payment API into your application with proper security, error handling, and best practices.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Security Considerations](#security-considerations)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- Node.js 16+ and npm/yarn
- MySQL/PostgreSQL database
- MoMo Developer Account
- SSL certificate for production

## 📦 Installation

### Backend Dependencies

```bash
cd backend
npm install crypto axios @prisma/client
```

### Frontend Dependencies

```bash
cd frontend-user
npm install @radix-ui/react-slot class-variance-authority clsx lucide-react qrcode @types/qrcode tailwind-merge
```

## ⚙️ Configuration

### 1. Environment Variables

Copy the example environment file and configure your MoMo credentials:

```bash
cp backend/.env.example backend/.env
```

Update the following variables in `backend/.env`:

```env
# MoMo Test Environment
MOMO_PARTNER_CODE=MOMOT5BZ20231213_TEST
MOMO_ACCESS_KEY=klm05TvNBzhg7h7j
MOMO_SECRET_KEY=at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa
MOMO_ENDPOINT=https://test-payment.momo.vn

# URLs
MOMO_REDIRECT_URL=http://localhost:3000/payment/result
MOMO_IPN_URL=http://localhost:3002/api/payments/momo/callback

# Security (Generate secure keys for production)
MOMO_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### 2. Production Configuration

For production, replace test credentials with your live MoMo credentials:

```env
MOMO_PARTNER_CODE=your_production_partner_code
MOMO_ACCESS_KEY=your_production_access_key
MOMO_SECRET_KEY=your_production_secret_key
MOMO_ENDPOINT=https://payment.momo.vn
```

## 🗄️ Database Setup

### 1. Run Prisma Migrations

```bash
cd backend
npx prisma migrate dev --name add-momo-payment-tables
npx prisma generate
```

### 2. Verify Database Schema

The migration will create these tables:
- `MomoPayment` - Payment transaction records
- `RateLimitLog` - Rate limiting logs
- `SecurityLog` - Security event logs

## 🔧 Backend Implementation

### API Endpoints

The integration provides these endpoints:

- `POST /api/payments/momo/create` - Create payment request
- `POST /api/payments/momo/callback` - Handle MoMo webhooks (IPN)
- `GET /api/payments/momo/status/:orderId` - Check payment status
- `POST /api/payments/momo/refund` - Process refunds
- `GET /api/payments/momo/history/:orderId` - Get payment history

### Usage Example

```javascript
// Create payment request
const paymentData = {
  orderId: "ORDER_123",
  amount: 50000, // 50,000 VND
  orderInfo: "Payment for order #123",
  extraData: {
    customerInfo: "Optional customer data"
  }
};

const response = await fetch('/api/payments/momo/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});

const result = await response.json();
if (result.success) {
  // Redirect user to result.data.payUrl
  window.open(result.data.payUrl, '_blank');
}
```

## 🎨 Frontend Implementation

### Basic Usage

```jsx
import MomoPayment from '@/components/MomoPayment';

function CheckoutPage() {
  return (
    <MomoPayment
      orderId="ORDER_123"
      amount={50000}
      orderInfo="Payment for order #123"
      onSuccess={(result) => {
        console.log('Payment successful:', result);
        // Handle successful payment
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Handle payment failure
      }}
      onCancel={() => {
        console.log('Payment cancelled');
        // Handle cancellation
      }}
    />
  );
}
```

### Payment Result Page

The integration includes a complete payment result page at `/payment/result` that:
- Verifies payment status
- Displays success/failure messages
- Provides navigation options
- Handles edge cases

## 🔒 Security Considerations

### 1. Signature Verification

All MoMo API requests and callbacks are automatically verified using HMAC-SHA256 signatures.

### 2. Rate Limiting

Built-in rate limiting protects against abuse:
- 10 payment requests per minute per IP
- 5 callback attempts per minute per order
- Configurable limits in middleware

### 3. Input Validation

Comprehensive validation for:
- Payment amounts (1,000 - 50,000,000 VND)
- Order IDs and request formats
- Webhook signatures and data integrity

### 4. Security Logging

All security events are logged:
- Failed signature verifications
- Rate limit violations
- Suspicious request patterns
- Database access attempts

### 5. Data Protection

- Sensitive data encryption at rest
- Secure credential storage
- PCI DSS compliance considerations

## 🧪 Testing

### 1. Test Environment Setup

Use MoMo's test environment with provided test credentials.

### 2. Test Payment Flow

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend-user && npm run dev

# Navigate to your checkout page and test payment
```

### 3. Test Cases

- ✅ Successful payment
- ❌ Failed payment (insufficient funds)
- ⏱️ Payment timeout
- 🔄 Duplicate payment attempts
- 🚫 Invalid signatu[object Object]obile app integration

### 4. Webhook Testing

Use ngrok or similar tool to expose your local callback URL:

```bash
ngrok http 3002
# Update MOMO_IPN_URL with the ngrok URL
```

## 🚀 Production Deployment

### 1. Environment Setup

- Use production MoMo credentials
- Enable HTTPS for all endpoints
- Set up proper DNS for callback URLs
- Configure firewall rules

### 2. Security Checklist

- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting enabled
- [ ] Monitoring and alerting set up
- [ ] Backup procedures in place

### 3. Monitoring

Monitor these metrics:
- Payment success rates
- Response times
- Error rates
- Security events
- Database performance

## 🔍 Troubleshooting

### Common Issues

#### 1. Invalid Signature Error
```
Error: Invalid payment signature
```
**Solution:** Verify your secret key and signature generation logic.

#### 2. Network Timeout
```
Error: Payment request timed out
```
**Solution:** Check network connectivity and increase timeout values.

#### 3. Callback Not Received
```
Warning: Payment callback not received
```
**Solution:** Verify IPN URL is accessible and properly configured.

#### 4. Amount Validation Error
```
Error: Amount must be between 1,000 and 50,000,000 VND
```
**Solution:** Check amount format and currency conversion.

### Debug Mode

Enable debug logging in development:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### Support Resources

- [MoMo Developer Documentation](https://developers.momo.vn)
- [API Reference](https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime/)
- MoMo Developer Support: merchant.care@momo.vn

## 📝 API Reference

### Payment Request

```typescript
interface PaymentRequest {
  orderId: string;           // Unique order identifier
  amount: number;            // Amount in VND (1,000 - 50,000,000)
  orderInfo: string;         // Order description
  extraData?: object;        // Additional data
  items?: PaymentItem[];     // Order items
  userInfo?: UserInfo;       // Customer information
  deliveryInfo?: DeliveryInfo; // Delivery details
}
```

### Payment Response

```typescript
interface PaymentResponse {
  success: boolean;
  data: {
    payUrl: string;          // Payment URL
    deeplink: string;        // MoMo app deep link
    qrCodeUrl: string;       // QR code data
    resultCode: number;      // Result code
    message: string;         // Response message
  };
}
```

## 🎯 Best Practices

1. **Always validate payment amounts** before creating requests
2. **Implement proper error handling** for all scenarios
3. **Use HTTPS** for all production endpoints
4. **Monitor payment flows** and set up alerts
5. **Test thoroughly** in sandbox environment
6. **Keep credentials secure** and rotate regularly
7. **Implement proper logging** for debugging and compliance
8. **Handle edge cases** like network failures and timeouts

---

## 📞 Support

For technical support or questions about this integration:

1. Check the troubleshooting section above
2. Review MoMo's official documentation
3. Contact MoMo developer support
4. Submit issues to your development team

**Last Updated:** October 2024
**Version:** 1.0.0
