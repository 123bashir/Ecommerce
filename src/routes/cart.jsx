import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPut, apiDelete, FILE_BASE_URL } from "../utils/api";
import { formatPrice } from "../utils/format";
import { AuthContext } from "../context/AuthContext";
import {
  FaShoppingCart,
  FaHome,
  FaStore,
  FaSearch,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaTimes,
  FaExclamationCircle,
  FaShieldAlt,
  FaUser
} from "react-icons/fa";

export default function Cart() {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [showOrderTypePopup, setShowOrderTypePopup] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    fetchCart();
  }, [currentUser, authLoading, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/cart");
      const items = response.data?.items || response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setCartItems(items);
      // Select all items by default
      setSelectedItems(new Set(items.map(item => item.cart_item_id)));
    } catch (error) {
      console.error("Error fetching cart:", error);
      setToast({ type: "error", message: "Failed to load cart" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      await apiPut(`/cart/update/${itemId}`, { quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      setToast({ type: "success", message: "Quantity updated" });
    } catch (error) {
      console.error("Error updating cart:", error);
      setToast({ type: "error", message: "Failed to update quantity" });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await apiDelete(`/cart/remove/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item.cart_item_id !== itemId));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setToast({ type: "success", message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing item:", error);
      setToast({ type: "error", message: "Failed to remove item" });
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.cart_item_id)));
    }
  };

  const handleProceedToCheckout = (orderType) => {
    if (selectedItems.size === 0) {
      setToast({ type: "error", message: "Please select at least one item" });
      return;
    }

    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.cart_item_id));
    const selectedTotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    navigate('/checkout', {
      state: {
        orderType,
        selectedItems: selectedCartItems,
        totalAmount: selectedTotal
      }
    });
  };

  const filteredItems = cartItems.filter((item) =>
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTotal = filteredItems
    .filter(item => selectedItems.has(item.cart_item_id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalAmount = filteredItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <>
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <div className="container">
            <div className="header-content">
              <div className="breadcrumb-section">
                <Link to="/" className="breadcrumb-link">
                  <FaHome /> Home
                </Link>
                <span className="separator">/</span>
                <Link to="/shop-list" className="breadcrumb-link">
                  <FaStore /> Shop
                </Link>
                <span className="separator">/</span>
                <span className="current">Cart</span>
              </div>
              <div className="user-info">
                <FaShieldAlt className="shield-icon" />
                <span>Secure Shopping</span>
                <div className="user-badge">
                  <FaUser /> {currentUser?.name || 'Guest'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="cart-content">
          <div className="container">
            <h1 className="page-title">
              <FaShoppingCart /> Shopping Cart
            </h1>

            {/* Search Bar */}
            <div className="search-section">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search cart items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="empty-cart">
                <FaBoxOpen className="empty-icon" />
                <h2>Your cart is empty</h2>
                <p>Add some items to get started!</p>
                <Link to="/shop-list" className="shop-btn">
                  <FaStore /> Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="cart-grid">
                {/* Cart Items */}
                <div className="items-section">
                  <div className="items-header">
                    <div className="select-all">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                        onChange={toggleSelectAll}
                        className="checkbox"
                      />
                      <label htmlFor="select-all">
                        Select All ({filteredItems.length} items)
                      </label>
                    </div>
                    <span className="selected-count">
                      {selectedItems.size} selected
                    </span>
                  </div>

                  <div className="cart-items">
                    {filteredItems.map((item) => (
                      <div
                        key={item.cart_item_id}
                        className={`cart-item ${selectedItems.has(item.cart_item_id) ? 'selected' : ''}`}
                      >
                        <div className="item-checkbox">
                          <input
                            type="checkbox"
                            id={`item-${item.cart_item_id}`}
                            checked={selectedItems.has(item.cart_item_id)}
                            onChange={() => toggleItemSelection(item.cart_item_id)}
                            className="checkbox"
                          />
                        </div>

                        <div className="item-image">
                          <img
                            src={item.image ? (item.image.startsWith('http') ? item.image : `${FILE_BASE_URL}${item.image}`) : 'assets/images/placeholder.jpg'}
                            alt={item.product_name}
                          />
                        </div>

                        <div className="item-details">
                          <Link to={`/product/${item.product_id}`} className="item-name">
                            {item.product_name}
                          </Link>
                          <p className="item-price">
                            {formatPrice(item.price)} <span className="per-unit">per unit</span>
                          </p>
                        </div>

                        <div className="item-quantity">
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <div className="item-total">
                          <span className="total-label">Total</span>
                          <span className="total-price">{formatPrice(item.price * item.quantity)}</span>
                        </div>

                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          title="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="summary-section">
                  <div className="summary-card">
                    <h2 className="summary-title">
                      <FaCheckCircle /> Order Summary
                    </h2>

                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Items Selected</span>
                        <span className="value">{selectedItems.size}</span>
                      </div>
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span className="value">{formatPrice(selectedTotal)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span className="value free">Free</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total</span>
                        <span className="value">{formatPrice(selectedTotal)}</span>
                      </div>
                    </div>

                    <button
                      className="checkout-btn"
                      onClick={() => setShowOrderTypePopup(true)}
                      disabled={selectedItems.size === 0}
                    >
                      <FaTruck /> Proceed to Checkout
                    </button>

                    <Link to="/shop-list" className="continue-shopping">
                      <FaStore /> Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Order Type Popup */}
      {showOrderTypePopup && (
        <div className="order-overlay" onClick={() => setShowOrderTypePopup(false)}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowOrderTypePopup(false)}>
              <FaTimes />
            </button>

            <h2 className="modal-title">
              <FaTruck /> Select Order Type
            </h2>

            <div className="order-options">
              <div
                className="order-option"
                onClick={() => handleProceedToCheckout('delivery')}
              >
                <div className="option-icon">
                  <FaTruck />
                </div>
                <div className="option-info">
                  <h3>Delivery Order</h3>
                  <p>We deliver directly to your doorstep</p>
                </div>
                <FaCheckCircle className="check-icon" />
              </div>

              <div
                className="order-option"
                onClick={() => handleProceedToCheckout('pickup')}
              >
                <div className="option-icon">
                  <FaStore />
                </div>
                <div className="option-info">
                  <h3>Pick-Up Order</h3>
                  <p>Collect your items from our nearest branch</p>
                </div>
                <FaCheckCircle className="check-icon" />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .cart-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .cart-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .cart-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .breadcrumb-section {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
        }

        .breadcrumb-link {
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s;
        }

        .breadcrumb-link:hover {
          color: white;
          transform: translateY(-2px);
        }

        .separator {
          color: rgba(255,255,255,0.6);
        }

        .current {
          color: white;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          color: white;
        }

        .shield-icon {
          font-size: 20px;
          color: #4ade80;
        }

        .user-badge {
          background: rgba(255,255,255,0.2);
          padding: 8px 15px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
        }

        .cart-content {
          padding: 40px 0;
        }

        .page-title {
          text-align: center;
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          animation: fadeInDown 0.6s ease;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .search-section {
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
        }

        .search-box {
          position: relative;
          max-width: 500px;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1.2rem;
        }

        .search-input {
          width: 100%;
          padding: 15px 15px 15px 45px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .empty-cart {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 5rem;
          color: #d1d5db;
          margin-bottom: 20px;
        }

        .empty-cart h2 {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .empty-cart p {
          color: #6b7280;
          margin-bottom: 30px;
        }

        .shop-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .shop-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .items-section {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 20px;
        }

        .select-all {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .select-all label {
          font-weight: 600;
          color: #374151;
          cursor: pointer;
        }

        .selected-count {
          color: #667eea;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: auto 80px 1fr auto auto auto;
          gap: 20px;
          align-items: center;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s;
          background: white;
        }

        .cart-item.selected {
          border-color: #667eea;
          background: #f9fafb;
        }

        .cart-item:hover {
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .item-checkbox {
          display: flex;
          align-items: center;
        }

        .item-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-name {
          font-weight: 600;
          color: #1f2937;
          text-decoration: none;
          transition: color 0.3s;
        }

        .item-name:hover {
          color: #667eea;
        }

        .item-price {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .per-unit {
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .item-quantity {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f3f4f6;
          padding: 8px;
          border-radius: 8px;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #667eea;
        }

        .qty-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-value {
          font-weight: 600;
          min-width: 30px;
          text-align: center;
        }

        .item-total {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }

        .total-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .total-price {
          font-weight: 700;
          color: #667eea;
          font-size: 1.1rem;
        }

        .remove-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .remove-btn:hover {
          background: #ef4444;
          color: white;
        }

        .summary-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          position: sticky;
          top: 20px;
        }

        .summary-title {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
        }

        .summary-details {
          margin-bottom: 25px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 1rem;
        }

        .summary-row.total {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1f2937;
          padding-top: 15px;
          border-top: 2px solid #e5e7eb;
          margin-top: 10px;
        }

        .summary-row .value {
          font-weight: 600;
        }

        .summary-row .free {
          color: #10b981;
        }

        .checkout-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          margin-bottom: 15px;
        }

        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .continue-shopping {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          color: #667eea;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s;
          font-weight: 600;
        }

        .continue-shopping:hover {
          background: #f3f4f6;
        }

        .toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 15px 25px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-weight: 600;
          z-index: 1000;
          animation: slideIn 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          background: #10b981;
        }

        .toast-error {
          background: #ef4444;
        }

        .order-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .order-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 90%;
          position: relative;
          animation: slideUp 0.4s ease;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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

        .close-modal {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f3f4f6;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1.2rem;
          color: #6b7280;
        }

        .close-modal:hover {
          background: #ef4444;
          color: white;
          transform: rotate(90deg);
        }

        .modal-title {
          font-size: 1.8rem;
          color: #1f2937;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .order-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .order-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .order-option:hover {
          border-color: #667eea;
          background: #f9fafb;
          transform: translateX(5px);
        }

        .option-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .option-info {
          flex: 1;
        }

        .option-info h3 {
          font-size: 1.1rem;
          color: #1f2937;
          margin-bottom: 5px;
        }

        .option-info p {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .check-icon {
          color: #10b981;
          font-size: 1.5rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .order-option:hover .check-icon {
          opacity: 1;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }

          .summary-section {
            order: -1;
          }

          .summary-card {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 1.8rem;
          }

          .cart-item {
            grid-template-columns: auto 60px 1fr;
            gap: 10px;
          }

          .item-quantity, .item-total, .remove-btn {
            grid-column: 1 / -1;
            justify-self: stretch;
          }

          .item-quantity {
            justify-content: center;
          }

          .item-total {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .user-info {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 10px;
          }

          .items-section {
            padding: 15px;
          }

          .cart-item {
            padding: 15px;
          }

          .item-image {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </>
  );
}
