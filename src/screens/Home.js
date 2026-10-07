import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { API_BASE_URL } from "../config";


export default function Home() {
  const [search, setSearch] = useState('');
  const [foodCat, setFoodCat] = useState([]);
  const [foodItem, setFoodItem] = useState([]);

  const loadData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/foodData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const text = await response.text();

      if (!response.ok) {
        console.error("Failed to fetch /api/foodData:", text || response.status);
        setFoodItem([]);
        setFoodCat([]);
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setFoodItem(Array.isArray(data[0]) ? data[0] : []);
      setFoodCat(Array.isArray(data[1]) ? data[1] : []);
    } catch (err) {
      console.error("Error loading food data:", err);
      setFoodItem([]);
      setFoodCat([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div>
        
        <div
          id="carouselExampleFade"
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
          style={{ objectFit: "contain !important" }}
        >
          <div className="carousel-inner" id="carousel">
            <div className="carousel-caption" style={{ zIndex: "9" }}>
              <div className="d-flex justify-content-center">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={search} onChange={(e)=>{setSearch(e.target.value)}}
                />
                
              </div>
            </div>
            <div className="carousel-item active">
              <img
                src="./images/d1.jpg"
                className="d-block w-100  "
                style={{ filter: "brightness(50%)" }}
                alt="..."
              />
            </div>
            <div className="carousel-item">
              <img
                src="./images/d2.jpg"
                className="d-block w-100 "
                style={{ filter: "brightness(50%)" }}
                alt="..."
              />
            </div>
            <div className="carousel-item">
              <img
                src="./images/d3.jpg"
                className="d-block w-100 "
                style={{ filter: "brightness(50%)" }}
                alt="..."
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleFade"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleFade"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      <div className="container">

{foodCat.length > 0 // Check if foodCat has any elements
  ? foodCat.map((data) => {
      return (
        <div key={data._id} className="category-section mb-3">
          <div className="fs-3 m-3 category-title">{data.CategoryName}</div>
          <hr />
          <div className="row g-4">
            {foodItem.length > 0 ? (
              foodItem
                .filter(
                  (item) =>
                    item.CategoryName === data.CategoryName &&
                    item.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((filterItems) => {
                  return (
                    <div
                      key={filterItems._id}
                      className="col-12 col-md-6 col-lg-3"
                    >
                      <Card
                        foodItem={filterItems}
                        options={filterItems.options[0]}
                      />
                    </div>
                  );
                })
            ) : (
              <div className="m-3">No Such Data Found</div>
            )}
          </div>
        </div>
      );
    })
  : ""}

      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
