const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const mongoDB = require("./db")
const cors = require('cors')

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/api', require("./Routes/CreateUser"));
app.use('/api', require("./Routes/DisplayData"));
app.use('/api/orders', require("./Routes/OrderRoutes"));
app.use('/api/payments', require("./Routes/PaymentRoutes"));
app.use('/api', require("./Routes/OrderData"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

mongoDB();


