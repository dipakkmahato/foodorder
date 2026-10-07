const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const sendFoodData = async (req, res) => {
  try {
    const db = mongoose.connection;
    const food_items = await db.collection("food_items").find({}).toArray();
    const foodCategory = await db.collection("foodCategory").find({}).toArray();
    res.send([food_items, foodCategory]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

router.get('/foodData', sendFoodData);
router.post('/foodData', sendFoodData);

module.exports = router;
