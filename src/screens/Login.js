import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Login() {
  const [credentials, setcredentials] = useState({
    email: "",
    password: "",
  });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setFeedback({
        type: "success",
        text: location.state.message,
      });
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/loginuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
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
          text: json.errors || json.error || "Enter a valid email and password.",
        });
        return;
      }

      localStorage.setItem("userEmail", credentials.email);
      localStorage.setItem("authToken", json.authToken);
      localStorage.setItem("userId", json.userId || "");
      localStorage.setItem("userRole", json.userRole || "user");
      setFeedback({
        type: "success",
        text: "Successfully logged in. Redirecting...",
      });
      setTimeout(() => {
        if ((json.userRole || "user") === "admin") {
          navigate("/admin/orders", { replace: true });
          return;
        }
        navigate("/", { replace: true });
      }, 900);
    } catch (error) {
      setFeedback({
        type: "danger",
        text: error.message || "Something went wrong while logging in.",
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
      <div className="auth-card auth-card--compact">
        <div className="auth-header">
          <span className="auth-badge">Welcome back</span>
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">Log in to continue your food ordering journey.</p>
        </div>

        {feedback ? (
          <div className={`alert alert-${feedback.type} auth-alert`} role="alert">
            {feedback.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Your password"
              required
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn btn-success auth-primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <Link to="/creatuser" className="btn btn-outline-light auth-secondary-btn">
              I’m a new user
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
