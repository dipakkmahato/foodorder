const crypto = require("crypto");
const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const User = require("../models/User");

const normalizeItems = (items = []) =>
  items.map((item) => ({
    itemId: item.itemId || item.id,
    name: item.name,
    qty: Number(item.qty) || 1,
    size: item.size || "Regular",
    price: Number(item.price) || 0,
    img: item.img || "",
  }));

const resolveUser = async ({ userId, userEmail }) => {
  if (userId) {
    return User.findById(userId);
  }
  if (userEmail) {
    return User.findOne({ email: userEmail });
  }
  return null;
};

const initiateEsewaPayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      userId,
      userEmail,
      items,
      deliveryAddress,
      subtotal,
      deliveryCharge = 0,
      totalAmount,
    } = req.body;

    const user = await resolveUser({ userId, userEmail });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const normalizedItems = normalizeItems(items);
    if (normalizedItems.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    const computedSubtotal = normalizedItems.reduce(
      (sum, item) => sum + item.price,
      0
    );
    const safeSubtotal = Number(subtotal ?? computedSubtotal);
    const safeDelivery = Number(deliveryCharge) || 0;
    const safeTotal = Number(totalAmount ?? safeSubtotal + safeDelivery);
    const transactionId = crypto.randomUUID();

    const order = await Order.create({
      userId: user._id,
      userEmail: user.email,
      items: normalizedItems,
      itemCount: normalizedItems.reduce((sum, item) => sum + item.qty, 0),
      subtotal: safeSubtotal,
      deliveryCharge: safeDelivery,
      totalAmount: safeTotal,
      deliveryAddress,
      paymentMethod: "eSewa",
      paymentStatus: "Processing",
      orderStatus: "Placed",
      transactionId,
      paymentGatewayPayload: {
        initiatedAt: new Date().toISOString(),
      },
    });

    const paymentUrl = process.env.ESEWA_PAYMENT_URL || "";
    const productCode = process.env.ESEWA_PRODUCT_CODE || "";
    const successUrl =
      process.env.ESEWA_SUCCESS_URL ||
      `http://localhost:3000/order-success/${order._id}?payment=esewa`;
    const failureUrl =
      process.env.ESEWA_FAILURE_URL ||
      "http://localhost:3000/checkout?payment=failed";

    return res.status(201).json({
      success: true,
      paymentConfigured: Boolean(paymentUrl && productCode),
      orderId: order._id,
      transactionId,
      paymentUrl,
      formFields: {
        amount: safeSubtotal,
        tax_amount: 0,
        total_amount: safeTotal,
        transaction_uuid: transactionId,
        product_code: productCode,
        success_url: successUrl,
        failure_url: failureUrl,
      },
      order,
    });
  } catch (error) {
    return next(error);
  }
};

const verifyEsewaPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { orderId, transactionId, paymentStatus, payload } = req.body;
    if (!orderId || !transactionId) {
      return res.status(400).json({
        success: false,
        error: "orderId and transactionId are required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const isPaid = String(paymentStatus || "").toUpperCase() === "SUCCESS";
    order.paymentStatus = isPaid ? "Paid" : "Failed";
    order.transactionId = transactionId;
    order.paymentDate = isPaid ? new Date() : order.paymentDate;
    order.paymentGatewayPayload = payload || null;
    if (isPaid) {
      order.orderStatus = "Placed";
    }

    await order.save();

    return res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      order,
    });
  } catch (error) {
    return next(error);
  }
};

const esewaCallback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { orderId, transactionId, status } = req.body;
    if (!orderId || !transactionId) {
      return res.status(400).json({
        success: false,
        error: "Missing callback data",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const paid = String(status || "").toUpperCase() === "SUCCESS";
    order.paymentStatus = paid ? "Paid" : "Failed";
    order.paymentDate = paid ? new Date() : order.paymentDate;
    order.transactionId = transactionId;
    await order.save();

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  initiateEsewaPayment,
  verifyEsewaPayment,
  esewaCallback,
};
