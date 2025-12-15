const crypto = require("crypto");
const axios = require("axios");
const { randomUUID } = require("crypto");
const prisma = require("../utills/db");
const { validatePaymentRequest } = require("../utills/momoValidation");
const { createPaymentNotification } = require("../utills/notificationHelpers");

// ================= CONFIG =================
const MOMO_CONFIG = {
  PARTNER_CODE: process.env.MOMO_PARTNER_CODE || "MOMO",
  ACCESS_KEY: process.env.MOMO_ACCESS_KEY,
  SECRET_KEY: process.env.MOMO_SECRET_KEY,
  ENDPOINT: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn",
  REDIRECT_URL:
    process.env.MOMO_REDIRECT_URL || "http://localhost:3000/payment/result",
  RETURN_URL:
    process.env.MOMO_RETURN_URL || "http://localhost:3000/payment/result",
  IPN_URL:
    process.env.MOMO_IPN_URL ||
    "http://localhost:3002/api/payments/momo/callback",
  NOTIFY_URL:
    process.env.MOMO_NOTIFY_URL ||
    "http://localhost:3002/api/payments/momo/callback",
  REQUEST_TYPE: process.env.MOMO_REQUEST_TYPE || "payWithMethod",
  ENVIRONMENT: process.env.MOMO_ENVIRONMENT || "sandbox",
};

// ================= HELPERS =================
function generateSignature(rawSignature, secretKey) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
}

/**
 * Map MoMo resultCode to payment status
 * Reference: https://developers.momo.vn/v3/vi/docs/payment/api/result-handling/resultcode
 * @param {number} resultCode - MoMo result code
 * @returns {object} { status: string, orderPaymentStatus: string }
 */
function getStatusFromResultCode(resultCode) {
  if (resultCode === null || resultCode === undefined || resultCode === -1) {
    // Not yet processed
    return {
      status: "PENDING",
      orderPaymentStatus: "PENDING",
      description: "Chờ xử lý",
    };
  }

  if (resultCode === 0) {
    // Success
    return {
      status: "SUCCESS",
      orderPaymentStatus: "PAID",
      description: "Thành công",
    };
  }

  if ([1000, 7000, 7002, 9000].includes(resultCode)) {
    // Pending statuses
    return {
      status: "PENDING",
      orderPaymentStatus: "PENDING",
      description:
        resultCode === 1000
          ? "Chờ xác nhận thanh toán"
          : resultCode === 7000
          ? "Đang xử lý"
          : resultCode === 7002
          ? "Đang xử lý bởi nhà cung cấp"
          : "Đã xác nhận, chờ capture",
    };
  }

  // All other codes are failures
  return {
    status: "FAILED",
    orderPaymentStatus: "FAILED",
    description: "Thanh toán thất bại",
  };
}

// ================= CREATE PAYMENT REQUEST =================
async function createPaymentRequest(req, res) {
  try {
    const {
      orderId,
      amount,
      orderInfo,
      extraData = "",
      items,
      userInfo,
      deliveryInfo,
    } = req.body;

    console.log("\n=== MoMo Payment Request ===");
    console.log("Order ID:", orderId);
    console.log("Amount:", amount);
    console.log("Order Info:", orderInfo);

    // Validate payment request
    const validation = validatePaymentRequest({ orderId, amount, orderInfo });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
        errors: validation.errors,
      });
    }

    // Convert amount to VND (integer)
    const amountInVND = Math.round(amount < 1000 ? amount * 24000 : amount);

    // Generate unique requestId and orderId for MoMo
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const momoOrderId = `${MOMO_CONFIG.PARTNER_CODE}_${timestamp}_${randomSuffix}`;
    const requestId = momoOrderId; // Use same value for requestId

    console.log("MoMo Order ID:", momoOrderId);
    console.log("Request ID:", requestId);
    console.log("Amount in VND:", amountInVND);

    // Build raw signature according to MoMo template (payWithMethod)
    const partnerName = "Test";
    const storeId = "MomoTestStore";
    const autoCapture = true;
    const orderGroupId = "";
    const lang = "vi";

    // Convert extraData to string for MoMo API
    const extraDataString = extraData
      ? typeof extraData === "string"
        ? extraData
        : JSON.stringify(extraData)
      : "";

    const rawSignature =
      `accessKey=${MOMO_CONFIG.ACCESS_KEY}` +
      `&amount=${amountInVND}` +
      `&extraData=${extraDataString}` +
      `&ipnUrl=${MOMO_CONFIG.IPN_URL}` +
      `&orderId=${momoOrderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${MOMO_CONFIG.PARTNER_CODE}` +
      `&redirectUrl=${MOMO_CONFIG.REDIRECT_URL}` +
      `&requestId=${requestId}` +
      `&requestType=${MOMO_CONFIG.REQUEST_TYPE}`;

    console.log("\n--- Raw Signature ---");
    console.log(rawSignature);

    const signature = generateSignature(rawSignature, MOMO_CONFIG.SECRET_KEY);

    console.log("\n--- Signature ---");
    console.log(signature);

    // Build request body
    const requestBody = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      partnerName: partnerName,
      storeId: storeId,
      requestId: requestId,
      amount: amountInVND,
      orderId: momoOrderId,
      orderInfo: orderInfo,
      redirectUrl: MOMO_CONFIG.REDIRECT_URL,
      ipnUrl: MOMO_CONFIG.IPN_URL,
      lang: lang,
      requestType: MOMO_CONFIG.REQUEST_TYPE,
      autoCapture: autoCapture,
      extraData: extraDataString,
      orderGroupId: orderGroupId,
      signature: signature,
    };

    console.log("\n--- Request Body ---");
    console.log(JSON.stringify(requestBody, null, 2));

    // Create payment record in database (resultCode defaults to -1 = not yet processed)
    const momoPayment = await prisma.momopayment.create({
      data: {
        id: randomUUID(),
        orderId: orderId,
        requestId: requestId,
        amount: amountInVND,
        orderInfo: orderInfo,
        extraData: extraDataString || "",
        updatedAt: new Date(),
      },
    });

    console.log("\n--- Created MomoPayment Record ---");
    console.log("ID:", momoPayment.id);

    // Send request to MoMo
    // Check if ENDPOINT already includes the path (to avoid duplication)
    const momoEndpoint = MOMO_CONFIG.ENDPOINT.includes("/v2/gateway/api/create")
      ? MOMO_CONFIG.ENDPOINT
      : `${MOMO_CONFIG.ENDPOINT}/v2/gateway/api/create`;
    console.log("\n--- Sending to MoMo ---");
    console.log("Endpoint:", momoEndpoint);

    try {
      const response = await axios.post(momoEndpoint, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("\n--- MoMo Response ---");
      console.log(JSON.stringify(response.data, null, 2));

      const { resultCode, payUrl, deeplink, qrCodeUrl, message } =
        response.data;

      // Update payment record with MoMo response
      // No need to set 'status' - we use resultCode directly
      await prisma.momopayment.update({
        where: { id: momoPayment.id },
        data: {
          payUrl: payUrl || null,
          deeplink: deeplink || null,
          qrCodeUrl: qrCodeUrl || null,
          resultCode: resultCode,
          message: message || null,
          updatedAt: new Date(),
        },
      });

      if (resultCode === 0) {
        return res.status(200).json({
          success: true,
          data: {
            orderId,
            payUrl,
            deeplink,
            qrCodeUrl,
            resultCode,
            message,
          },
        });
      } else {
        // MoMo returned an error
        return res.status(400).json({
          success: false,
          message: message || "MoMo payment creation failed",
          data: {
            resultCode,
            message,
          },
        });
      }
    } catch (axiosError) {
      console.error("\n--- Axios Error ---");
      console.error(axiosError.response?.data || axiosError.message);

      // Update payment record with error info
      await prisma.momopayment.update({
        where: { id: momoPayment.id },
        data: {
          message: axiosError.response?.data?.message || axiosError.message,
          resultCode: axiosError.response?.data?.resultCode || -2, // -2 = API error
          updatedAt: new Date(),
        },
      });

      // Return detailed MoMo error to frontend
      return res.status(400).json({
        success: false,
        message: "MoMo API error",
        data: axiosError.response?.data || { message: axiosError.message },
      });
    }
  } catch (error) {
    console.error("\n=== Create Payment Error ===");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// ================= PAYMENT CALLBACK =================
async function handlePaymentCallback(req, res) {
  console.log("\n========================================");
  console.log("🔔 MOMO CALLBACK FUNCTION CALLED");
  console.log("========================================");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request Method:", req?.method);
  console.log("Request URL:", req?.url);
  console.log("Request Headers:", JSON.stringify(req?.headers, null, 2));

  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    console.log("📋 Full Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Order ID:", orderId);
    console.log("Request ID:", requestId);
    console.log("Result Code:", resultCode);
    console.log("Message:", message);
    console.log("Trans ID:", transId);
    console.log("Pay Type:", payType);
    console.log("========================================");

    // Verify signature (for production)
    const rawSignature =
      `accessKey=${MOMO_CONFIG.ACCESS_KEY}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const expectedSignature = generateSignature(
      rawSignature,
      MOMO_CONFIG.SECRET_KEY
    );

    console.log("\n--- Signature Verification ---");
    console.log("Expected:", expectedSignature);
    console.log("Received:", signature);

    if (
      MOMO_CONFIG.ENVIRONMENT !== "sandbox" &&
      signature !== expectedSignature
    ) {
      console.warn("⚠️ Signature mismatch!");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find payment record
    const payment = await prisma.momopayment.findFirst({
      where: { requestId: requestId },
    });

    if (!payment) {
      console.error("Payment record not found for requestId:", requestId);
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Get status from resultCode
    const { status, orderPaymentStatus } = getStatusFromResultCode(resultCode);

    // Update payment record (only resultCode matters, status is derived from it)
    await prisma.momopayment.update({
      where: { id: payment.id },
      data: {
        transId: transId || null,
        resultCode: resultCode,
        message: message || null,
        payType: payType || null,
        responseTime: responseTime ? new Date(responseTime) : null,
        updatedAt: new Date(),
      },
    });

    // Update order status
    const order = await prisma.customer_order.findUnique({
      where: { id: payment.orderId },
    });

    if (order) {
      // Auto-update order status based on payment result
      let newOrderStatus = order.status;
      if (resultCode === 0) {
        // Payment successful - set to 'processing' (paid and confirmed)
        newOrderStatus = "processing";
      } else if (status === "FAILED") {
        // Payment failed - keep order in pending or cancel it
        // Don't change status if user wants to retry payment
        newOrderStatus = order.status;
      }

      await prisma.customer_order.update({
        where: { id: payment.orderId },
        data: {
          payment_status: orderPaymentStatus,
          payment_method: "MOMO",
          payment_transaction_id: transId || null,
          status: newOrderStatus,
          updated_at: new Date(),
        },
      });

      // Create notification only for final statuses (success or failure)
      if (order.email && (resultCode === 0 || status === "FAILED")) {
        await createPaymentNotification({
          userId: order.email,
          orderId: order.id,
          status: resultCode === 0 ? "success" : "failed",
          amount: amount,
          transactionId: transId,
        });
      }

      console.log(
        `✅ Order ${order.id} updated to status: ${newOrderStatus}, payment_status: ${orderPaymentStatus} (resultCode: ${resultCode})`
      );
    }

    return res.status(200).json({
      success: true,
      message: resultCode === 0 ? "Payment successful" : "Payment failed",
    });
  } catch (error) {
    console.error("\n=== Callback Error ===");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// ================= QUERY PAYMENT STATUS =================
async function queryPaymentStatus(orderId) {
  try {
    const payment = await prisma.momopayment.findFirst({
      where: { orderId: orderId },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      orderId: payment.orderId,
      requestId: payment.requestId,
      amount: payment.amount,
      status: payment.status,
      payUrl: payment.payUrl,
      deeplink: payment.deeplink,
      qrCodeUrl: payment.qrCodeUrl,
      transId: payment.transId,
      resultCode: payment.resultCode,
      message: payment.message,
      payType: payment.payType,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  } catch (error) {
    console.error("\n=== Query Status Error ===");
    console.error(error);
    throw error;
  }
}

// ================= REFUND PAYMENT =================
async function refundPayment(req, res) {
  try {
    const { orderId, amount, description } = req.body;

    // Find original payment
    const payment = await prisma.momopayment.findFirst({
      where: {
        orderId: orderId,
        status: "SUCCESS",
      },
    });

    if (!payment || !payment.transId) {
      return res.status(404).json({
        success: false,
        message: "Original payment not found or not successful",
      });
    }

    const requestId = `${MOMO_CONFIG.PARTNER_CODE}_${Date.now()}_refund`;
    const refundAmount = amount || payment.amount;

    // Build raw signature for refund
    const rawSignature =
      `accessKey=${MOMO_CONFIG.ACCESS_KEY}` +
      `&amount=${refundAmount}` +
      `&description=${description}` +
      `&orderId=${payment.orderId}` +
      `&partnerCode=${MOMO_CONFIG.PARTNER_CODE}` +
      `&requestId=${requestId}` +
      `&transId=${payment.transId}`;

    const signature = generateSignature(rawSignature, MOMO_CONFIG.SECRET_KEY);

    const requestBody = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      orderId: payment.orderId,
      requestId: requestId,
      amount: refundAmount,
      transId: payment.transId,
      lang: "vi",
      description: description || "Refund",
      signature: signature,
    };

    console.log("\n--- Refund Request ---");
    console.log(JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      `${MOMO_CONFIG.ENDPOINT}/v2/gateway/api/refund`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("\n--- Refund Response ---");
    console.log(JSON.stringify(response.data, null, 2));

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("\n=== Refund Error ===");
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Refund failed",
      error: error.response?.data || error.message,
    });
  }
}

// ================= TEST CALLBACK (FOR DEVELOPMENT) =================
async function testCallback(req, res) {
  try {
    const { requestId, resultCode = 0 } = req.body;

    console.log("\n========================================");
    console.log("🧪 MANUAL TEST CALLBACK");
    console.log("========================================");
    console.log("Request ID:", requestId);
    console.log("Result Code:", resultCode);

    // Find payment record
    const payment = await prisma.momopayment.findFirst({
      where: { requestId: requestId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Get status from resultCode using helper
    const { status, orderPaymentStatus, description } =
      getStatusFromResultCode(resultCode);

    // Update payment record
    await prisma.momopayment.update({
      where: { id: payment.id },
      data: {
        transId: `TEST_${Date.now()}`,
        resultCode: resultCode,
        message: description,
        updatedAt: new Date(),
      },
    });

    // Update order status
    const order = await prisma.customer_order.findUnique({
      where: { id: payment.orderId },
    });

    if (order) {
      await prisma.customer_order.update({
        where: { id: payment.orderId },
        data: {
          payment_status: orderPaymentStatus,
          payment_method: "MOMO",
          payment_transaction_id: `TEST_${Date.now()}`,
          status: resultCode === 0 ? "processing" : order.status,
          updated_at: new Date(),
        },
      });

      console.log(
        `✅ Order ${order.id} updated to payment_status: ${orderPaymentStatus}`
      );
    }

    return res.status(200).json({
      success: true,
      message: `Payment updated: ${description}`,
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        resultCode: resultCode,
        status: status,
        orderPaymentStatus: orderPaymentStatus,
        description: description,
      },
    });
  } catch (error) {
    console.error("\n=== Test Callback Error ===");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  createPaymentRequest,
  handlePaymentCallback,
  queryPaymentStatus,
  refundPayment,
  testCallback,
};
