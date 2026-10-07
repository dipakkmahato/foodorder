import React, { useEffect, useRef, useState } from "react";
import { useDispatchCart, useCart } from "./ContextReducer";

export default function Card(props) {
  const dispatch = useDispatchCart();
  const data = useCart();
  const priceRef = useRef();
  const options = props.options || {};
  const priceOptions = Object.keys(options);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(priceOptions[0] || "");

  const handleAddToCart = async () => {
    const existingItem = data.find(
      (item) => item.id === props.foodItem._id && item.size === size
    );

    if (existingItem) {
      await dispatch({
        type: "UPDATE",
        id: props.foodItem._id,
        price: finalPrice,
        qty: qty,
        size: size,
      });
    } else {
      await dispatch({
        type: "ADD",
        id: props.foodItem._id,
        name: props.foodItem.name,
        price: finalPrice,
        qty: qty,
        size: size,
      });
    }
  };

  const finalPrice = qty * (parseInt(options[size]) || 0);

  useEffect(() => {
    if (priceRef.current && priceRef.current.value) {
      setSize(priceRef.current.value);
    }
  }, []);

  return (
    <div className="food-card-wrap h-100">
      <div className="card mt-3 food-card h-100">
        <img
          src={props.foodItem.img}
          className="card-img-top food-card-img"
          alt={props.foodItem.name}
        />
        <div className="card-body food-card-body d-flex flex-column">
          <h5 className="card-title food-card-title">{props.foodItem.name}</h5>
          <p className="card-text food-card-desc">{props.foodItem.description}</p>

          <div className="container w-100 food-card-controls">
            <select
              className="m-2 h-100 bg-success rounded food-card-select"
              onChange={(e) => setQty(e.target.value)}
            >
              {Array.from(Array(6), (e, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <select
              className="m-2 h-100 bg-success rounded food-card-select"
              ref={priceRef}
              onChange={(e) => setSize(e.target.value)}
            >
              {priceOptions.map((data) => (
                <option key={data} value={data}>
                  {data}
                </option>
              ))}
            </select>

            <div className="d-inline h-100 fs-5 food-card-price">रु {finalPrice}/-</div>
          </div>

          <hr className="food-card-divider" />

          <button
            className="btn btn-success justify-center ms-2 mt-auto food-card-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
