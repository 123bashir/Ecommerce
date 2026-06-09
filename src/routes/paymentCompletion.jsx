import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUniversity, FaCopy, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import { apiPost } from "../utils/api";
import { formatPrice } from "../utils/format";

export default function PaymentCompletion() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    orderData,
    paymentMethod,
    amount,
    orderType,
    cartItems,
    pickupBranch,
    pickupDate,
    customerInfo
  } = location.state || {};

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  useEffect(() => {
    if (!orderData || !paymentMethod) {
      navigate('/');
    }
  }, [orderData, paymentMethod, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentMethod.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showCustomPopup = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  const handleConfirmation = async () => {
    setSubmitting(true);
    try {
      const response = await apiPost("/payments/confirm", {
        order_id: orderData.id,
        payment_method: paymentMethod.code,
        amount: amount,
        customer_name: customerInfo?.name || orderData.customer,
        customer_email: customerInfo?.email || orderData.customer_email,
        notes: "Bank Transfer Confirmation",
        order_type: orderType || 'delivery',
        cart_items: cartItems || [],
        pickup_date: pickupDate,
        pickup_branch: pickupBranch
      });

      if (response.success) {
        showCustomPopup("Your payment will be verified within 30 minutes. Check your email for order confirmation!", 'success');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      showCustomPopup("Failed to confirm payment. Please try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderData || !paymentMethod) return null;

  return (
    <div className="payment-completion-container">
      <div className="card">
        <div className="header">
          <FaUniversity className="icon" />
          <h2>Bank Transfer Details</h2>
          <p>Please transfer the exact amount to the account below.</p>
        </div>

        <div className="amount-section">
          <span className="label">Amount to Pay</span>
          <span className="amount">{formatPrice(amount)}</span>
        </div>

        <div className="bank-details">
          <div className="detail-row">
            <span className="label">Bank Name</span>
            <span className="value">{paymentMethod.bank_name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Account Name</span>
            <span className="value">{paymentMethod.account_name}</span>
          </div>
          <div className="detail-row account-number">
            <span className="label">Account Number</span>
            <div className="number-copy">
              <span className="value">{paymentMethod.account_number}</span>
              <button onClick={handleCopy} className="copy-btn">
                {copied ? <FaCheckCircle /> : <FaCopy />}
              </button>
            </div>
            {copied && <span className="copied-tooltip">Copied!</span>}
          </div>
        </div>

        <div className="instructions">
          <p>1. Open your banking app.</p>
          <p>2. Transfer <strong>{formatPrice(amount)}</strong> to the account above.</p>
          <p>3. Click the button below once completed.</p>
        </div>

        <button
          className="confirm-btn"
          onClick={handleConfirmation}
          disabled={submitting}
        >
          {submitting ? "Processing..." : "I Have Transferred the Money"}
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className={`popup-box popup-${popupType}`} onClick={e => e.stopPropagation()}>
            {popupType === 'success' ? <FaCheckCircle className="popup-icon" /> : <FaMoneyBillWave className="popup-icon" />}
            <p>{popupMessage}</p>
            <button onClick={() => setShowPopup(false)} className="popup-close-btn">OK</button>
          </div>
        </div>
      )}

      <style>{`
        .payment-completion-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4f6f8;
          padding: 20px;
        }
        .card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        .header .icon {
          font-size: 50px;
          color: #007bff;
          margin-bottom: 20px;
        }
        .header h2 {
          margin-bottom: 10px;
          color: #333;
        }
        .header p {
          color: #666;
          margin-bottom: 30px;
        }
        .amount-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        .amount-section .label {
          display: block;
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .amount-section .amount {
          font-size: 32px;
          font-weight: 700;
          color: #007bff;
        }
        .bank-details {
          text-align: left;
          margin-bottom: 30px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-row .label {
          color: #666;
        }
        .detail-row .value {
          font-weight: 600;
          color: #333;
        }
        .account-number .value {
          font-size: 18px;
          letter-spacing: 1px;
        }
        .number-copy {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .copy-btn {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          font-size: 18px;
        }
        .instructions {
          text-align: left;
          background: #eef2f7;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        .instructions p {
          margin-bottom: 10px;
          color: #555;
          font-size: 14px;
        }
        .instructions p:last-child {
          margin-bottom: 0;
        }
        .confirm-btn {
          width: 100%;
          padding: 15px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        .confirm-btn:hover {
          background: #218838;
        }
        .confirm-btn:disabled {
          background: #94d3a2;
          cursor: not-allowed;
        }
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        .popup-box {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          max-width: 400px;
          width: 90%;
          animation: slideUp 0.4s ease;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .popup-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }
        .popup-success .popup-icon {
          color: #28a745;
        }
        .popup-error .popup-icon {
          color: #dc3545;
        }
        .popup-box p {
          font-size: 18px;
          color: #333;
          margin-bottom: 30px;
        }
        .popup-close-btn {
          padding: 12px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .popup-close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
      `}</style>
    </div>
  );
}
