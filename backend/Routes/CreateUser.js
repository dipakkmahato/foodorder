const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const jwtSecrete = "MynameisDipakKumarsingh$#";
router.post(
  "/CreateUser",
  [
    body("email").isLength(),
    body("name").isLength({ min: 5 }),
    body("password", "Incorrect Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
     
    const salt = await bcrypt.genSalt(10);
    let secPassword = await bcrypt.hash(req.body.password,salt)

    try {
      await User.create({
        name: req.body.name,
        password: secPassword,
        email: req.body.email,
        location: req.body.location,
      });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        return res.status(409).json({ success: false, error: "Email already exists" });
      }
      res.status(500).json({ success: false, error: "Failed to create user" });
    }
  }
);

router.post(
  "/loginuser",
  [
    body("email").isLength(),
    body("password", "Incorrect Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    let email = req.body.email;
    try {
      let userData = await User.findOne({ email });
      if (!userData) {
        return res
          .status(400)
          .json({ success: false, errors: "Email address not found" });
      }
       
      const pwdCompare = await bcrypt.compare(req.body.password,userData.password)
      if (!pwdCompare) {
        return res
          .status(400)
          .json({ success: false, errors: "Wrong password" });
      }

      const data = {
        user:{
          id:userData.id
        }
      }
      const authToken = jwt.sign(data,jwtSecrete)
      return res.json({
        success: true,
        authToken: authToken,
        userId: userData._id.toString(),
        userEmail: userData.email,
        userRole: userData.role || "user",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Failed to login" });
    }
  }
);

module.exports = router;
