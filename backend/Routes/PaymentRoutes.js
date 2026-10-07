const express = require("express");
const { body } = require("express-validator");
const {
  initiateEsewaPayment,
  verifyEsewaPayment,
  esewaCallback,
} = require("../controllers/paymentController");

const router = express.Router();

const paymentValidation = [
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

router.post("/esewa/initiate", paymentValidation, initiateEsewaPayment);
router.post(
  "/esewa/verify",
  [
    body("orderId").isMongoId().withMessage("Valid order id is required"),
    body("transactionId").isString().withMessage("Transaction id is required"),
  ],
  verifyEsewaPayment
);
router.post(
  "/esewa/callback",
  [
    body("orderId").isMongoId().withMessage("Valid order id is required"),
    body("transactionId").isString().withMessage("Transaction id is required"),
  ],
  esewaCallback
);

module.exports = router;
