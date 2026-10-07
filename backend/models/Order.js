const mongoose = require("mongoose");

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.Mixed,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    size: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    img: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      default: [],
    },
    itemCount: {
      type: Number,
      required: true,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "eSewa"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed", "Reverted"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
    },
    transactionId: {
      type: String,
      default: "",
    },
    paymentDate: {
      type: Date,
    },
    paymentGatewayPayload: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", OrderSchema);
