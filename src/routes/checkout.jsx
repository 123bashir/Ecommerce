import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    FaHome, FaShoppingCart, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaCity, FaMailBulk, FaGlobe, FaStore, FaClock, FaStickyNote,
    FaTruck, FaCreditCard, FaShieldAlt, FaTimes, FaCheckCircle,
    FaExclamationCircle, FaUniversity, FaChevronRight, FaLock
} from 'react-icons/fa';
import { apiGet, apiPost } from '../utils/api';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useContext(AuthContext);

    const [orderType, setOrderType] = useState(location.state?.orderType || 'delivery');
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('error');
    const [focusedInput, setFocusedInput] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postCode: '',
        country: 'Nigeria',
        pickupBranch: 'Medile Branch',
        scheduledDate: '',
        notes: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                firstName: currentUser.firstName || currentUser.name?.split(' ')[0] || '',
                lastName: currentUser.lastName || currentUser.name?.split(' ')[1] || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                address: currentUser.address || '',
                city: currentUser.city || '',
                postCode: currentUser.postCode || currentUser.zipCode || '',
                country: currentUser.country || 'Nigeria'
            }));
        }

        fetchCart();
        fetchPaymentMethods();
    }, [currentUser]);

    useEffect(() => {
        if (location.state?.orderType) {
            setOrderType(location.state.orderType);
        }
    }, [location.state?.orderType]);

    const fetchCart = async () => {
        try {
            if (location.state?.selectedItems && location.state?.selectedItems.length > 0) {
                setCartItems(location.state.selectedItems);
                setTotalAmount(location.state.totalAmount);
                setLoading(false);
                return;
            }

            const response = await apiGet("/cart");
            if (response.success) {
                const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
                setCartItems(items);
                setTotalAmount(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
            }
        } catch (error) {
            // console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const response = await apiGet("/payments/methods");
            if (response.success && Array.isArray(response.data.paymentMethods)) {
                const enabledMethods = response.data.paymentMethods.filter(m => m.enabled);
                setPaymentMethods(enabledMethods);
            } else {
                setPaymentMethods([]);
            }
        } catch (error) {
            // console.error("Error fetching payment methods:", error);
            setPaymentMethods([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showCustomAlert = (message, type = 'error') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handlePayNow = () => {
        if (orderType === 'delivery') {
            if (!formData.address || !formData.city || !formData.phone) {
                showCustomAlert("Please fill in all required delivery fields.");
                return;
            }
        } else {
            if (!formData.scheduledDate || !formData.pickupBranch) {
                showCustomAlert("Please select a pickup branch and date.");
                return;
            }
        }
        setShowPaymentPopup(true);
    };

    const handlePaymentMethodSelect = async (method) => {
        try {
            // Validation


            if (!totalAmount || totalAmount <= 0) {
                showCustomAlert("Your cart is empty or total is invalid.", 'error');
                return;
            }

            /* console.log("Creating order with:", {
                customer_id: currentUser?.id || 'guest-123',
                total_amount: totalAmount,
                items_count: cartItems.length
            }); */

            let orderData;
            if (orderType === 'delivery') {
                const response = await apiPost("/orders", {
                    customer_id: currentUser?.id || 'guest-123',
                    customer_name: `${formData.firstName} ${formData.lastName}`,
                    customer_email: formData.email,
                    total_amount: totalAmount,
                    items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                    status: 'pending'
                });
                if (response.success) orderData = response.data;
            } else {
                const response = await apiPost("/pickup", {
                    order_id: `PK-${Date.now()}`,
                    customer_name: `${formData.firstName} ${formData.lastName}`,
                    customer_email: formData.email,
                    total_amount: totalAmount,
                    products_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                    scheduled_date: formData.scheduledDate,
                    status: 'pending'
                });
                if (response.success) orderData = response.data;
            }

            if (orderData) {
                if (method.code === 'bank_transfer' || method.name.toLowerCase().includes('bank')) {
                    navigate('/payment-completion', {
                        state: {
                            orderData,
                            paymentMethod: method,
                            amount: totalAmount,
                            orderType: orderType,
                            cartItems: cartItems.map(item => ({
                                name: item.product_name || item.name,
                                quantity: item.quantity,
                                price: item.price,
                                image: item.image || item.product_image
                            })),
                            pickupBranch: formData.pickupBranch,
                            pickupDate: formData.scheduledDate,
                            customerInfo: {
                                name: `${formData.firstName} ${formData.lastName}`,
                                email: formData.email,
                                phone: formData.phone
                            }
                        }
                    });
                } else {
                    showCustomAlert(`Selected ${method.name}. Integration coming soon!`, 'success');
                }
            }
        } catch (error) {
            // console.error("Error creating order:", error);
            showCustomAlert("Failed to create order. Please try again.");
        }
    };

    const formatPrice = (price) => {
        return `₦${parseFloat(price).toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                <div className="spinner"></div>
                <p>Loading checkout...</p>
            </div>
        );
    }

    return (
        <>
            <div className="checkout-container">
                <div className="checkout-header">
                    <div className="container">
                        <div className="header-content">
                            <div className="breadcrumb-section">
                                <Link to="/" className="breadcrumb-link">
                                    <FaHome /> Home
                                </Link>
                                <FaChevronRight className="separator" />
                                <Link to="/cart" className="breadcrumb-link">
                                    <FaShoppingCart /> Cart
                                </Link>
                                <FaChevronRight className="separator" />
                                <span className="current">Checkout</span>
                            </div>
                            <div className="user-info">
                                <div className="secure-badge">
                                    <FaLock className="lock-icon" />
                                    <span>Secure Checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="checkout-content">
                    <div className="container">
                        <div className="page-header">
                            <h1 className="page-title">
                                {orderType === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
                            </h1>
                            <p className="page-subtitle">
                                {orderType === 'delivery'
                                    ? 'Please provide your delivery information below.'
                                    : 'Select your preferred pickup location and time.'}
                            </p>
                        </div>

                        <div className="checkout-grid">
                            <div className="form-section">
                                <div className="form-card">
                                    <div className="card-header">
                                        <div className="header-icon">
                                            {orderType === 'delivery' ? <FaTruck /> : <FaStore />}
                                        </div>
                                        <h2>{orderType === 'delivery' ? 'Shipping Address' : 'Pickup Information'}</h2>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label className={focusedInput === 'firstName' || formData.firstName ? 'active' : ''}>
                                                <FaUser /> Full Name
                                            </label>
                                            <div className="name-grid">
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    placeholder="First Name"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedInput('firstName')}
                                                    onBlur={() => setFocusedInput('')}
                                                    className="form-input"
                                                />
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Last Name"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedInput('lastName')}
                                                    onBlur={() => setFocusedInput('')}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className={focusedInput === 'email' || formData.email ? 'active' : ''}>
                                                <FaEnvelope /> Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedInput('email')}
                                                onBlur={() => setFocusedInput('')}
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className={focusedInput === 'phone' || formData.phone ? 'active' : ''}>
                                                <FaPhone /> Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="+234 XXX XXX XXXX"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedInput('phone')}
                                                onBlur={() => setFocusedInput('')}
                                                className="form-input"
                                            />
                                        </div>

                                        {orderType === 'delivery' ? (
                                            <>
                                                <div className="form-group full-width">
                                                    <label className={focusedInput === 'address' || formData.address ? 'active' : ''}>
                                                        <FaMapMarkerAlt /> Delivery Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        placeholder="Street address, building, apartment"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        onFocus={() => setFocusedInput('address')}
                                                        onBlur={() => setFocusedInput('')}
                                                        className="form-input"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className={focusedInput === 'city' || formData.city ? 'active' : ''}>
                                                        <FaCity /> City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        placeholder="City"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        onFocus={() => setFocusedInput('city')}
                                                        onBlur={() => setFocusedInput('')}
                                                        className="form-input"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className={focusedInput === 'postCode' || formData.postCode ? 'active' : ''}>
                                                        <FaMailBulk /> Post Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="postCode"
                                                        placeholder="Post Code"
                                                        value={formData.postCode}
                                                        onChange={handleInputChange}
                                                        onFocus={() => setFocusedInput('postCode')}
                                                        onBlur={() => setFocusedInput('')}
                                                        className="form-input"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="active">
                                                        <FaGlobe /> Country
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        readOnly
                                                        className="form-input readonly"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="form-group">
                                                    <label className="active">
                                                        <FaStore /> Select Branch
                                                    </label>
                                                    <div className="select-wrapper">
                                                        <select
                                                            name="pickupBranch"
                                                            value={formData.pickupBranch}
                                                            onChange={handleInputChange}
                                                            className="form-select"
                                                        >
                                                            <option value="Medile Branch">Medile Branch</option>
                                                            <option value="Bakin Asibiti Branch">Bakin Asibiti Branch</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label className="active">
                                                        <FaClock /> Pickup Date & Time
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        name="scheduledDate"
                                                        value={formData.scheduledDate}
                                                        onChange={handleInputChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="form-group full-width">
                                            <label className={focusedInput === 'notes' || formData.notes ? 'active' : ''}>
                                                <FaStickyNote /> Additional Notes (Optional)
                                            </label>
                                            <textarea
                                                name="notes"
                                                placeholder="Any special instructions or notes..."
                                                rows="3"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedInput('notes')}
                                                onBlur={() => setFocusedInput('')}
                                                className="form-textarea"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="summary-section">
                                <div className="summary-card">
                                    <div className="card-header">
                                        <div className="header-icon secondary">
                                            <FaShoppingCart />
                                        </div>
                                        <h2>Order Summary</h2>
                                    </div>

                                    <div className="cart-items-scroll">
                                        {cartItems.map(item => (
                                            <div key={item.cart_item_id} className="cart-item">
                                                <div className="item-image">
                                                    {/* Placeholder for image if available */}
                                                    <div className="img-placeholder">
                                                        {(item.product_name || item.name || 'P').charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="item-details">
                                                    <span className="item-name">{item.product_name || item.name}</span>
                                                    <span className="item-meta">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="summary-totals">
                                        <div className="total-row">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(totalAmount)}</span>
                                        </div>
                                        <div className="total-row">
                                            <span>Shipping</span>
                                            <span className="free-badge">Free</span>
                                        </div>
                                        <div className="total-row grand-total">
                                            <span>Total Amount</span>
                                            <span>{formatPrice(totalAmount)}</span>
                                        </div>
                                    </div>

                                    <button className="checkout-btn" onClick={handlePayNow}>
                                        <span>Proceed to Payment</span>
                                        <FaCreditCard />
                                    </button>

                                    <div className="security-note">
                                        <FaShieldAlt />
                                        <span>Payments are secure and encrypted</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAlert && (
                <div className="alert-overlay">
                    <div className={`alert-popup alert-${alertType}`}>
                        {alertType === 'success' ? <FaCheckCircle className="alert-icon" /> : <FaExclamationCircle className="alert-icon" />}
                        <p>{alertMessage}</p>
                    </div>
                </div>
            )}

            {showPaymentPopup && (
                <div className="payment-overlay" onClick={() => setShowPaymentPopup(false)}>
                    <div className="payment-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowPaymentPopup(false)}>
                            <FaTimes />
                        </button>

                        <div className="modal-header">
                            <div className="modal-icon">
                                <FaCreditCard />
                            </div>
                            <h2 className="modal-title">Select Payment Method</h2>
                            <p>Choose how you want to pay for your order</p>
                        </div>

                        <div className="payment-methods">
                            {paymentMethods.map(method => (
                                <div
                                    key={method.id}
                                    className="payment-method-card"
                                    onClick={() => handlePaymentMethodSelect(method)}
                                >
                                    <div className="method-icon-wrapper">
                                        <FaUniversity />
                                    </div>
                                    <div className="method-content">
                                        <h4>{method.name}</h4>
                                        <p>{method.description}</p>
                                    </div>
                                    <div className="select-indicator">
                                        <FaCheckCircle />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Outfit', sans-serif;
                }

                .checkout-loading {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    color: #64748b;
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .checkout-container {
                    min-height: 100vh;
                    background: #f8fafc;
                    padding-bottom: 60px;
                }

                .checkout-header {
                    background: white;
                    padding: 20px 0;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .breadcrumb-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #64748b;
                    font-size: 0.95rem;
                }

                .breadcrumb-link {
                    color: #64748b;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: color 0.2s;
                }

                .breadcrumb-link:hover {
                    color: #6366f1;
                }

                .separator {
                    font-size: 0.75rem;
                    color: #cbd5e1;
                }

                .current {
                    color: #0f172a;
                    font-weight: 600;
                }

                .secure-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f0fdf4;
                    color: #16a34a;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .page-header {
                    margin: 40px 0;
                    text-align: center;
                }

                .page-title {
                    font-size: 2.5rem;
                    color: #0f172a;
                    margin-bottom: 10px;
                    font-weight: 700;
                }

                .page-subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 40px;
                    align-items: start;
                }

                .form-card, .summary-card {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
                    border: 1px solid #f1f5f9;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .header-icon {
                    width: 48px;
                    height: 48px;
                    background: #e0e7ff;
                    color: #4f46e5;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .header-icon.secondary {
                    background: #f0fdf4;
                    color: #16a34a;
                }

                .card-header h2 {
                    font-size: 1.5rem;
                    color: #0f172a;
                    font-weight: 600;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.2s;
                }

                .form-group label.active {
                    color: #4f46e5;
                }

                .name-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-input, .form-select, .form-textarea {
                    padding: 14px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: all 0.2s;
                    background: #f8fafc;
                    color: #0f172a;
                    width: 100%;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }

                .form-input::placeholder {
                    color: #94a3b8;
                }

                .form-input.readonly {
                    background: #f1f5f9;
                    cursor: not-allowed;
                    color: #64748b;
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .cart-items-scroll {
                    max-height: 300px;
                    overflow-y: auto;
                    margin: -10px -10px 20px -10px;
                    padding: 10px;
                }

                .cart-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 16px;
                    margin-bottom: 12px;
                    transition: transform 0.2s;
                }

                .cart-item:hover {
                    transform: translateX(4px);
                    background: #f1f5f9;
                }

                .img-placeholder {
                    width: 48px;
                    height: 48px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #64748b;
                }

                .item-details {
                    flex: 1;
                }

                .item-name {
                    display: block;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 4px;
                }

                .item-meta {
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .item-price {
                    font-weight: 700;
                    color: #4f46e5;
                }

                .summary-totals {
                    border-top: 2px dashed #e2e8f0;
                    padding-top: 24px;
                    margin-top: 24px;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    color: #64748b;
                }

                .total-row.grand-total {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #f1f5f9;
                    color: #0f172a;
                    font-weight: 700;
                    font-size: 1.25rem;
                }

                .free-badge {
                    background: #dcfce7;
                    color: #16a34a;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .checkout-btn {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-top: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3);
                }

                .checkout-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.4);
                }

                .security-note {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 16px;
                    color: #94a3b8;
                    font-size: 0.85rem;
                }

                /* Payment Modal */
                .payment-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease;
                }

                .payment-modal {
                    background: white;
                    border-radius: 32px;
                    padding: 40px;
                    width: 100%;
                    max-width: 550px;
                    position: relative;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: slideUp 0.3s ease;
                }

                .modal-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .modal-icon {
                    width: 64px;
                    height: 64px;
                    background: #e0e7ff;
                    color: #4f46e5;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    margin: 0 auto 16px;
                }

                .modal-title {
                    font-size: 1.5rem;
                    color: #0f172a;
                    margin-bottom: 8px;
                }

                .payment-method-card {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 24px;
                    border: 2px solid #e2e8f0;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 16px;
                }

                .payment-method-card:hover {
                    border-color: #6366f1;
                    background: #f8fafc;
                }

                .method-icon-wrapper {
                    width: 56px;
                    height: 56px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: #4f46e5;
                }

                .method-content h4 {
                    font-size: 1.1rem;
                    color: #0f172a;
                    margin-bottom: 4px;
                }

                .method-content p {
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .select-indicator {
                    margin-left: auto;
                    color: #e2e8f0;
                    font-size: 1.5rem;
                    transition: color 0.2s;
                }

                .payment-method-card:hover .select-indicator {
                    color: #6366f1;
                }

                .close-modal {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    background: #f1f5f9;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .close-modal:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }

                /* Alert */
                .alert-overlay {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 2000;
                    animation: slideIn 0.3s ease;
                }

                .alert-popup {
                    background: white;
                    padding: 16px 24px;
                    border-radius: 16px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 320px;
                    border-left: 6px solid;
                }

                .alert-error { border-color: #ef4444; }
                .alert-success { border-color: #22c55e; }

                .alert-icon { font-size: 1.25rem; }
                .alert-error .alert-icon { color: #ef4444; }
                .alert-success .alert-icon { color: #22c55e; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                @media (max-width: 968px) {
                    .checkout-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .summary-section {
                        order: -1;
                    }
                    
                    .container {
                        padding: 0 16px;
                    }
                    
                    .page-title {
                        font-size: 2rem;
                    }
                }

                @media (max-width: 640px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .name-grid {
                        grid-template-columns: 1fr;
                    }

                    .page-title {
                        font-size: 1.75rem;
                    }
                    
                    .form-card, .summary-card {
                        padding: 20px;
                    }
                }
            `}</style>
        </>
    );
};

export default Checkout;