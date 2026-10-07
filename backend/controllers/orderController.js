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

const createOrder = async (req, res, next, paymentMethod = "COD") => {
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
      paymentStatus = paymentMethod === "COD" ? "Pending" : "Processing",
      orderStatus = "Placed",
      transactionId = "",
      paymentGatewayPayload = null,
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

    const order = await Order.create({
      userId: user._id,
      userEmail: user.email,
      items: normalizedItems,
      itemCount: normalizedItems.reduce((sum, item) => sum + item.qty, 0),
      subtotal: safeSubtotal,
      deliveryCharge: safeDelivery,
      totalAmount: safeTotal,
      deliveryAddress,
      paymentMethod,
      paymentStatus,
      orderStatus,
      transactionId,
      paymentDate: paymentStatus === "Paid" ? new Date() : undefined,
      paymentGatewayPayload,
    });

    return res.status(201).json({
      success: true,
      message:
        paymentMethod === "COD"
          ? "Order placed successfully"
          : "Payment initiated",
      order,
    });
  } catch (error) {
    return next(error);
  }
};

const placeCodOrder = async (req, res, next) => createOrder(req, res, next, "COD");

const placeEsewaOrder = async (req, res, next) =>
  createOrder(req, res, next, "eSewa");

const getMyOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email } = req.query;

    const filter = {};
    if (userId) {
      filter.userId = userId;
    } else if (email) {
      filter.userEmail = email;
    } else {
      return res.status(400).json({
        success: false,
        error: "userId or email is required",
      });
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    return res.json({ success: true, order });
  } catch (error) {
    return next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { status } = req.body;
    const allowed = ["Preparing", "Out for Delivery", "Delivered", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  placeCodOrder,
  placeEsewaOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
