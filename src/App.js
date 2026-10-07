import "./App.css";
import Home from "./screens/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./screens/Login";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Signup from "./screens/Signup.js";
import { CartProvider } from "./components/ContextReducer.js";
import MyOrder from "./screens/MyOrder.js";
import Checkout from "./screens/Checkout.js";
import OrderSuccess from "./screens/OrderSuccess.js";
import AdminOrders from "./screens/AdminOrders.js";


function App() {
  return (
    
    <CartProvider>

    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/creatuser" element={<Signup />} />
          <Route exact path="/myOrder" element={<MyOrder />} />
          <Route exact path="/my-orders" element={<MyOrder />} />
          <Route exact path="/checkout" element={<Checkout />} />
          <Route exact path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route exact path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </div>
    </Router>
    </CartProvider>
   
  );
}

export default App;
