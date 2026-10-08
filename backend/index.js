const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const mongoDB = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());

app.use("/api", require("./Routes/CreateUser"));
app.use("/api", require("./Routes/DisplayData"));
app.use("/api/orders", require("./Routes/OrderRoutes"));
app.use("/api/payments", require("./Routes/PaymentRoutes"));
app.use("/api", require("./Routes/OrderData"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "KhanaOrders backend is running",
  });
});

app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

mongoDB();


