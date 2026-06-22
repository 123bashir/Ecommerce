import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../utils/api";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCity, FaFlag, FaArrowRight, FaGoogle, FaFacebook } from "react-icons/fa";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: ""
};

export default function Register() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const toastTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hide");
      preloader.style.display = "none";
    }
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const triggerToast = (type, message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visible: true, type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      triggerToast("error", "Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      setStatus({ type: "", message: "" });
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
        ...(formData.address && { address: formData.address }),
        ...(formData.city && { city: formData.city }),
        ...(formData.state && { state: formData.state }),
        ...(formData.zipCode && { zipCode: formData.zipCode })
      };
      const response = await apiPost("/users/auth/register", payload);
      setStatus({
        type: "success",
        message: response.message || "Registration successful. Redirecting to login..."
      });
      triggerToast("success", response.message || "Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to register." });
      triggerToast("error", error.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-split">
        {/* Left Side - Form */}
        <div className="register-form-side">
          <div className="register-header">
            <Link to="/" className="logo-text">IB General Ent</Link>
            <h2>Create Account</h2>
            <p>Join us to start shopping for quality products.</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="e.g. +234 800 000 0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address (Optional)</label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  name="address"
                  placeholder="Delivery Address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <div className="input-wrapper">
                  <FaCity className="input-icon" />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>State</label>
                <div className="input-wrapper">
                  <FaFlag className="input-icon" />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"} <FaArrowRight />
            </button>

            <div className="divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google">
                <FaGoogle /> Google
              </button>
              <button type="button" className="social-btn facebook">
                <FaFacebook /> Facebook
              </button>
            </div>

            <p className="login-prompt">
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </form>
        </div>

        {/* Right Side - Image/Decoration */}
        <div className="register-image-side">
          <div className="image-content">
            <h2>Join Our Community</h2>
            <p>Experience the best online shopping with fast delivery, secure payments, and 24/7 support.</p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className={`auth-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .register-split {
          display: flex;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          width: 100%;
          max-width: 1100px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          min-height: 700px;
        }

        .register-form-side {
          flex: 1.2;
          padding: 40px 50px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow-y: auto;
          max-height: 100vh;
        }

        .register-image-side {
          flex: 0.8;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .register-image-side::before {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
          top: -25%;
          left: -25%;
        }

        .image-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
        }

        .image-content h2 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .image-content p {
          font-size: 1.1rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .register-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
          text-decoration: none;
          display: block;
          margin-bottom: 15px;
        }

        .register-header h2 {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .register-header p {
          color: #6b7280;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #374151;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .input-wrapper input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s;
          background: #f9fafb;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 25px 0;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .divider span {
          padding: 0 15px;
        }

        .social-login {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }

        .social-btn {
          flex: 1;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .social-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .social-btn.google { color: #db4437; }
        .social-btn.facebook { color: #4267B2; }

        .login-prompt {
          text-align: center;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .login-prompt a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 25px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
          z-index: 2000;
          animation: slideIn 0.3s ease;
          border-left: 4px solid #667eea;
        }

        .auth-toast.error { border-left-color: #ef4444; }
        .auth-toast.success { border-left-color: #10b981; }

        .toast-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #9ca3af;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 900px) {
          .register-split {
            flex-direction: column;
            max-width: 550px;
          }
          .register-image-side {
            display: none;
          }
          .register-form-side {
            padding: 40px 30px;
            max-height: none;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
