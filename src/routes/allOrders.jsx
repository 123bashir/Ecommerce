import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiGet, apiDelete } from '../utils/api';
import { formatPrice } from '../utils/format';
import {
  FaHome,
  FaShoppingCart,
  FaClipboardList,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaStore,
  FaTimes,
  FaExclamationCircle,
  FaBoxOpen,
  FaReceipt,
  FaTrash
} from 'react-icons/fa';

export default function AllOrders() {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alertPopup, setAlertPopup] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      preloader.classList.add('hide');
      preloader.style.display = 'none';
    }

    // Fetch orders only if user is available
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch both delivery and pickup orders in parallel
      const [deliveryResponse, pickupResponse] = await Promise.all([
        apiGet('/orders/my-orders').catch(() => ({ success: false, data: [] })),
        apiGet('/pickup/my-pickups').catch(() => ({ success: false, data: [] }))
      ]);

      let allOrders = [];

      // Process delivery orders
      if (deliveryResponse.success && deliveryResponse.data) {
        const deliveryOrders = (Array.isArray(deliveryResponse.data) ? deliveryResponse.data : []).map(order => ({
          ...order,
          orderType: 'delivery',
          displayType: 'Delivery'
        }));
        allOrders = [...allOrders, ...deliveryOrders];
      }

      // Process pickup orders
      if (pickupResponse.success && pickupResponse.data) {
        const pickupOrders = (Array.isArray(pickupResponse.data) ? pickupResponse.data : []).map(order => ({
          ...order,
          orderType: 'pickup',
          displayType: 'Pickup'
        }));
        allOrders = [...allOrders, ...pickupOrders];
      }

      // Sort by creation date (most recent first)
      allOrders.sort((a, b) => new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date));
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'error') => {
    setAlertPopup({ show: true, message, type });
    setTimeout(() => setAlertPopup({ show: false, message: '', type: 'error' }), 3000);
  };

  const handleDelete = async (orderToDelete) => {
    try {
      setDeleting(true);

      // Find the order to determine its type
      const order = orders.find(o => (o.id === orderToDelete || o.order_id === orderToDelete));

      if (!order) {
        showAlert('Order not found');
        return;
      }

      // Use correct endpoint based on order type
      const endpoint = order.orderType === 'pickup' || order.order_type === 'pickup'
        ? `/pickup/${order.id}`
        : `/orders/${order.id}`;

      const response = await apiDelete(endpoint);

      if (response.success) {
        // Remove from local state
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setDeleteConfirm(null);
        showAlert('Order deleted successfully', 'success');
      } else {
        showAlert(response.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showAlert(error.message || 'An error occurred while deleting the order');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'picked_up':
        return <FaCheckCircle style={{ color: '#10b981' }} />;
      case 'pending':
        return <FaClock style={{ color: '#f59e0b' }} />;
      case 'cancelled':
      case 'expired':
        return <FaTimes style={{ color: '#ef4444' }} />;
      default:
        return <FaExclamationCircle style={{ color: '#6b7280' }} />;
    }
  };

  const getPaymentStatusBadge = (status) => {
    const styles = {
      paid: { background: '#10b981', color: 'white' },
      pending: { background: '#f59e0b', color: 'white' },
      failed: { background: '#ef4444', color: 'white' }
    };
    const style = styles[status?.toLowerCase()] || styles.pending;
    return (
      <span style={{
        ...style,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {status || 'Pending'}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.order_id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || (order.status?.toLowerCase() || '') === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <>
      <div className="orders-container">
        <div className="orders-header">
          <div className="container">
            <div className="header-content">
              <div className="breadcrumb-section">
                <Link to="/" className="breadcrumb-link">
                  <FaHome /> Home
                </Link>
                <span className="separator">/</span>
                <span className="current">My Orders</span>
              </div>
            </div>
          </div>
        </div>

        <div className="orders-content">
          <div className="container">
            <h1 className="page-title">
              <FaClipboardList /> My Orders
            </h1>

            <div className="orders-controls">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by order ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All Orders
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <FaBoxOpen className="empty-icon" />
                <h3>No Orders Found</h3>
                <p>You haven't placed any orders yet.</p>
                <Link to="/" className="shop-btn">
                  <FaShoppingCart /> Start Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-grid">
                {filteredOrders.map((order) => (
                  <div key={order.id || order.order_id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">
                        <FaReceipt />
                        <span>#{order.order_id}</span>
                        <span className="label">Payment:</span>
                        <span className="value">
                          {getPaymentStatusBadge(order.payment_status)}
                        </span>
                      </div>
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        <span>Total:</span>
                        <span className="amount">{formatPrice(order.total_amount)}</span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => setDeleteConfirm(order.order_id || order.id)}
                        title="Delete Order"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <FaTrash />
            </div>
            <h3>Delete Order?</h3>
            <p>Are you sure you want to delete order <strong>#{deleteConfirm}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Popup */}
      {alertPopup.show && (
        <div className="alert-overlay">
          <div className={`alert-popup alert-${alertPopup.type}`}>
            {alertPopup.type === 'success' ? <FaCheckCircle className="alert-icon" /> : <FaExclamationCircle className="alert-icon" />}
            <p>{alertPopup.message}</p>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .orders-loading {
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

        .orders-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .orders-header {
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

        .orders-content {
          padding: 40px 0;
        }

        .page-title {
          text-align: center;
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 40px;
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

        .orders-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1.1rem;
        }

        .search-input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 10px 20px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          color: #6b7280;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .empty-state {
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

        .empty-state h3 {
          font-size: 1.8rem;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 30px;
        }

        .shop-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 30px;
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

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .order-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          transition: all 0.3s;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .order-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          border-color: #667eea;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
        }

        .order-id {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .order-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          text-transform: capitalize;
        }

        .order-details {
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-row .value {
          color: #1f2937;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .badge.pickup {
          background: #e0f2fe;
          color: #0369a1;
        }

        .badge.delivery {
          background: #f0fdf4;
          color: #15803d;
        }

        .value.code {
          font-family: monospace;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 1px;
        }

        .order-footer {
          padding-top: 15px;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-total {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
        }

        .order-total span:first-child {
          color: #6b7280;
          font-weight: 600;
        }

        .amount {
          color: #667eea;
          font-weight: 700;
          font-size: 1.3rem;
        }

        .delete-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .delete-btn:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
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
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 20px;
          width: 90%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-icon {
          width: 60px;
          height: 60px;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 20px;
        }

        .modal-content h3 {
          margin-bottom: 10px;
          color: #1f2937;
        }

        .modal-content p {
          color: #6b7280;
          margin-bottom: 25px;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .cancel-btn, .confirm-btn {
          padding: 10px 25px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.3s;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #4b5563;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .confirm-btn {
          background: #ef4444;
          color: white;
        }

        .confirm-btn:hover {
          background: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .confirm-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 1.8rem;
          }

          .orders-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: 100%;
          }

          .filter-buttons {
            justify-content: center;
          }

          .orders-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 10px;
          }

          .order-card {
            padding: 20px;
          }

          .filter-btn {
            flex: 1;
            min-width: 100px;
            font-size: 0.9rem;
          }

          .modal-content {
            margin: 20px;
            padding: 25px;
          }

          .modal-content h3 {
            font-size: 1.3rem;
          }

          .modal-content p {
            font-size: 0.95rem;
          }
        }

        /* Alert Popup Styles */
        .alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 2000;
          pointer-events: none;
          padding-top: 80px;
        }

        .alert-popup {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 25px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          animation: slideDown 0.4s ease;
          pointer-events: all;
          max-width: 500px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-popup.alert-error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .alert-popup.alert-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .alert-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .alert-popup p {
          margin: 0;
          font-size: 1rem;
        }
      `}</style>
    </>
  );
}
