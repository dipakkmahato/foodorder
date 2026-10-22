import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { API_BASE_URL } from "../config";


export default function Home() {
  const [search, setSearch] = useState('');
  const [foodCat, setFoodCat] = useState([]);
  const [foodItem, setFoodItem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/foodData`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Menu request failed");
      }
      const data = await response.json();
      if (!Array.isArray(data) || !Array.isArray(data[0]) || !Array.isArray(data[1])) {
        throw new Error("Invalid menu response");
      }
      setFoodItem(data[0]);
      setFoodCat(data[1]);
    } catch {
      setError("We couldn't load the menu. Please try again.");
      setFoodItem([]);
      setFoodCat([]);
    } finally {
      setLoading(false);
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
      <div className="container" aria-busy={loading}>
        {loading && <p className="m-3" role="status">Loading menu…</p>}
        {error && (
          <div className="alert alert-danger my-3" role="alert">
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={loadData}>Try again</button>
          </div>
        )}
        {!loading && !error && (foodCat.length === 0 || foodItem.length === 0) && (
          <p className="m-3" role="status">No menu items are available yet. Please check back soon.</p>
        )}
        {!loading && !error && foodItem.length > 0 && !foodItem.some(
          (item) => item.name.toLowerCase().includes(search.toLowerCase())
        ) && <p className="m-3" role="status">No items match your search.</p>}


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
