import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiPost } from "../utils/api";
import { FaEnvelope, FaLock, FaArrowRight, FaGoogle, FaFacebook } from "react-icons/fa";

export default function Login() {
  const { updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const toastTimerRef = useRef(null);
  const navigate = useNavigate();

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'reset'
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

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
    if (!formData.email || !formData.password) {
      triggerToast("error", "Email and password are required.");
      return;
    }
    try {
      setLoading(true);
      const response = await apiPost("/users/auth/login", formData);
      // Extract token and user data separately
      const { token, data: userData } = response;

      // Store token in sessionStorage
      if (token) {
        sessionStorage.setItem('token', token);
      }

      // Update context with user data only (no token)
      updateUser(userData);
      triggerToast("success", response?.message || "Login successful. Redirecting...");
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      triggerToast("error", error.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordEmail = async (e) => {
    e.preventDefault();
    if (!forgotPasswordData.email) {
      triggerToast("error", "Email is required.");
      return;
    }
    try {
      setForgotPasswordLoading(true);
      await apiPost("/users/auth/forgot-password", { email: forgotPasswordData.email });
      triggerToast("success", "Verification code sent to your email.");
      setForgotPasswordStep('otp');
    } catch (error) {
      triggerToast("error", error.message || "Failed to send verification code.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!forgotPasswordData.otp) {
      triggerToast("error", "Verification code is required.");
      return;
    }
    try {
      setForgotPasswordLoading(true);
      await apiPost("/users/auth/verify-otp", {
        email: forgotPasswordData.email,
        otp: forgotPasswordData.otp
      });
      triggerToast("success", "Verification code verified.");
      setForgotPasswordStep('reset');
    } catch (error) {
      triggerToast("error", error.message || "Invalid verification code.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword) {
      triggerToast("error", "Both password fields are required.");
      return;
    }
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      triggerToast("error", "Passwords do not match.");
      return;
    }
    if (forgotPasswordData.newPassword.length < 8) {
      triggerToast("error", "Password must be at least 8 characters long.");
      return;
    }
    try {
      setForgotPasswordLoading(true);
      await apiPost("/users/auth/reset-password", {
        email: forgotPasswordData.email,
        newPassword: forgotPasswordData.newPassword
      });
      triggerToast("success", "Password reset successfully. You can now login.");
      setShowForgotPassword(false);
      setForgotPasswordStep('email');
      setForgotPasswordData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      triggerToast("error", error.message || "Failed to reset password.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="login-container">
      <div className="login-split">
        {/* Left Side - Form */}
        <div className="login-form-side">
          <div className="login-header">
            <Link to="/" className="logo-text">Almubarak</Link>
            <h2>Welcome Back!</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="forgot-link"
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"} <FaArrowRight />
            </button>

            <div className="divider">
              <span>Or sign in with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google">
                <FaGoogle /> Google
              </button>
              <button type="button" className="social-btn facebook">
                <FaFacebook /> Facebook
              </button>
            </div>

            <p className="signup-prompt">
              Don't have an account? <Link to="/register">Sign up for free</Link>
            </p>
          </form>
        </div>

        {/* Right Side - Image/Decoration */}
        <div className="login-image-side">
          <div className="image-content">
            <h2>Shop Smarter, Live Better</h2>
            <p>Access exclusive deals, track your orders, and enjoy a seamless shopping experience.</p>
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForgotPassword(false)}>×</button>

            <div className="modal-header">
              <h3>Reset Password</h3>
              <p>Follow the steps to recover your account access.</p>
            </div>

            {forgotPasswordStep === 'email' && (
              <form onSubmit={handleForgotPasswordEmail}>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? "Sending..." : "Send Code"}
                </button>
              </form>
            )}

            {forgotPasswordStep === 'otp' && (
              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit code"
                    value={forgotPasswordData.otp}
                    onChange={handleForgotPasswordChange}
                    maxLength="6"
                    className="otp-input"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? "Verifying..." : "Verify Code"}
                </button>
                <button type="button" className="back-link" onClick={() => setForgotPasswordStep('email')}>
                  Back to Email
                </button>
              </form>
            )}

            {forgotPasswordStep === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New password"
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordChange}
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
                      value={forgotPasswordData.confirmPassword}
                      onChange={handleForgotPasswordChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .login-split {
          display: flex;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          width: 100%;
          max-width: 1000px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          min-height: 600px;
        }

        .login-form-side {
          flex: 1;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-image-side {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .login-image-side::before {
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

        .login-header {
          margin-bottom: 40px;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
          text-decoration: none;
          display: block;
          margin-bottom: 20px;
        }

        .login-header h2 {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .login-header p {
          color: #6b7280;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-weight: 500;
          font-size: 0.95rem;
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

        .input-wrapper input, .otp-input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
          background: #f9fafb;
        }

        .otp-input {
          padding-left: 15px !important;
          text-align: center;
          letter-spacing: 5px;
          font-size: 1.2rem !important;
        }

        .input-wrapper input:focus, .otp-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .forgot-link {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
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
          margin: 30px 0;
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

        .signup-prompt {
          text-align: center;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .signup-prompt a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: white;
          padding: 40px;
          border-radius: 24px;
          width: 90%;
          max-width: 450px;
          position: relative;
          animation: slideUp 0.3s ease;
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #9ca3af;
          cursor: pointer;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .back-link {
          background: none;
          border: none;
          color: #6b7280;
          width: 100%;
          margin-top: 15px;
          cursor: pointer;
          font-size: 0.9rem;
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

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .login-split {
            flex-direction: column;
            max-width: 500px;
          }
          .login-image-side {
            display: none;
          }
          .login-form-side {
            padding: 40px 30px;
          }
        }
      `}</style>
    </div>
  );
}
