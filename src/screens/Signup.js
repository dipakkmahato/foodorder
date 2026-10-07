import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Signup() {
  const navigate = useNavigate();
  const [credentials, setcredentials] = useState({
    name: "",
    email: "",
    password: "",
    geolocation: "",
  });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/CreateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
          location: credentials.geolocation,
        }),
      });

      const text = await response.text();
      let json = {};

      try {
        json = text ? JSON.parse(text) : {};
      } catch (error) {
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      if (!response.ok || !json.success) {
        setFeedback({
          type: "danger",
          text: json.error || "Please check your details and try again.",
        });
        return;
      }

      setFeedback({
        type: "success",
        text: "Successfully signed up. Redirecting to login...",
      });

      setTimeout(() => {
        navigate("/login", {
          state: { message: "Successfully signed up. Please log in." },
        });
      }, 900);
    } catch (error) {
      setFeedback({
        type: "danger",
        text: error.message || "Something went wrong while signing up.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (event) => {
    setcredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Create account</span>
          <h1 className="auth-title">Join GoFood</h1>
          <p className="auth-subtitle">Create your account to order faster and track your meals.</p>
        </div>

        {feedback ? (
          <div className={`alert alert-${feedback.type} auth-alert`} role="alert">
            {feedback.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control auth-input"
              name="name"
              value={credentials.name}
              onChange={onChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control auth-input"
              name="email"
              value={credentials.email}
              onChange={onChange}
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              placeholder="name@example.com"
              required
            />
            <div id="emailHelp" className="form-text auth-help">
              We’ll never share your email with anyone else.
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control auth-input"
              name="password"
              value={credentials.password}
              onChange={onChange}
              id="exampleInputPassword1"
              placeholder="Choose a secure password"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="exampleInputAddress" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control auth-input"
              name="geolocation"
              value={credentials.geolocation}
              onChange={onChange}
              id="exampleInputAddress"
              placeholder="Your delivery address"
              required
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn btn-success auth-primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Sign up"}
            </button>
            <Link to="/login" className="btn btn-outline-light auth-secondary-btn">
              Already a user
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
