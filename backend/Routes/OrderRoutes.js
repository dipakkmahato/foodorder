const express = require("express");
const { body, param } = require("express-validator");
const {
  placeCodOrder,
  placeEsewaOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

const orderValidation = [
  body("userEmail").isEmail().withMessage("Valid email is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("deliveryAddress")
    .isLength({ min: 3 })
    .withMessage("Delivery address is required"),
  body("subtotal").isNumeric().withMessage("Subtotal must be numeric"),
  body("deliveryCharge").optional().isNumeric(),
  body("totalAmount").isNumeric().withMessage("Total amount must be numeric"),
  body("userId").optional().isString(),
];

router.post("/checkout/cod", orderValidation, placeCodOrder);
router.post("/checkout/esewa", orderValidation, placeEsewaOrder);
router.get("/mine/:userId", getMyOrders);
router.get("/mine", getMyOrders);
router.get("/all", getAllOrders);
router.get("/:orderId", param("orderId").isMongoId(), getOrderById);
router.patch("/:orderId/status", [
  param("orderId").isMongoId().withMessage("Valid order id required"),
  body("status").isIn(["Preparing", "Out for Delivery", "Delivered", "Cancelled"]),
], updateOrderStatus);

module.exports = router;
