import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import { apiGet, FILE_BASE_URL } from "../utils/api";

// Development API URL (use this for local development)
// const API_URL = 'http://localhost:3000/api';

// Production API URL (uncomment when DNS is configured)
const API_URL = 'https://api.almubarakcosmetics.com.ng/api';

// Hardcoded hero images
const HERO_IMAGES = [
  'assets/images/hero/a.jpg',
  'assets/images/hero/b.jpg',
  'assets/images/hero/c.jpg',
  'assets/images/hero/d.jpg',
  'assets/images/hero/e.jpg',
  'assets/images/hero/f.jpg',
  'assets/images/hero/g.jpeg',
  'assets/images/hero/h.jpeg',
  'assets/images/hero/i.jpeg',
  'assets/images/hero/j.jpeg',
  'assets/images/hero/k.jpeg',
  'assets/images/hero/l.jpeg',

];

export default function Dashboard() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  // New state for header dropdowns
  const [orders, setOrders] = useState([]);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Clear user context
    updateUser(null);
    // Clear session storage
    sessionStorage.clear();
    // Navigate to login
    navigate('/login');
  };

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories/`);
        setCategories(response.data?.data || response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    // Fetch all products
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/totalProduct`);
        const productsData = response.data?.data || response.data || [];

        // Process products to handle images properly
        const processedProducts = productsData.map(product => {
          // Handle images - can be array, comma-separated string, or null
          let images = [];
          if (product.images) {
            if (Array.isArray(product.images)) {
              images = product.images.filter(img => img && img.trim() !== '');
            } else if (typeof product.images === 'string') {
              images = product.images.split(',').map(img => img.trim()).filter(img => img !== '');
            }
          }

          // Normalize image URLs - handle relative paths, full URLs, and missing images
          const normalizedImages = images.map(img => {
            if (!img) return null;
            // If it's already a full URL, return as is
            if (img.startsWith('http://') || img.startsWith('https://')) {
              return img;
            }
            // If it starts with /, it's a relative path from root
            if (img.startsWith('/')) {
              return img.startsWith('/uploads/') ? `http://localhost:3000/${img}` : img;
            }
            // Otherwise, assume it's relative to the API base or uploads folder
            // Check if it's an upload path
            if (img.includes('uploads/')) {
              return `http://localhost:3000/${img.startsWith('/') ? img.slice(1) : img}`;
            }
            // Default: return as relative path
            return img.startsWith('assets/') ? img : `assets/images/products/${img}`;
          }).filter(img => img !== null);

          return {
            ...product,
            images: normalizedImages
          };
        });

        setProducts(processedProducts);
        // Filter popular products - handle both string and boolean values
        const popular = processedProducts.filter(product => {
          const isPopular = product.isPopular || product.is_popular;
          if (typeof isPopular === 'string') {
            return ['1', 'true', 'yes', 'on'].includes(isPopular.toLowerCase());
          }
          return Boolean(isPopular);
        });
        // Store all popular products (not used in hero anymore, but keep for other uses)
        setPopularProducts(popular);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProducts();

    // Fetch orders and cart for header dropdowns
    if (currentUser) {
      fetchOrders();
      fetchCart();
    }

    // Initialize sliders and other UI elements


    if (typeof window !== "undefined" && typeof window.tns === "function") {
      try {
        window.tns({
          container: ".hero-slider",
          slideBy: "page",
          autoplay: true,
          autoplayButtonOutput: false,
          mouseDrag: true,
          gutter: 0,
          items: 1,
          nav: false,
          controls: true,
          controlsText: [
            '<i class="lni lni-chevron-left"></i>',
            '<i class="lni lni-chevron-right"></i>'
          ]
        });
      } catch (e) {
        // no-op if already initialized or if container missing
      }

      try {
        window.tns({
          container: ".brands-logo-carousel",
          autoplay: true,
          autoplayButtonOutput: false,
          mouseDrag: true,
          gutter: 15,
          nav: false,
          controls: false,
          responsive: {
            0: { items: 1 },
            540: { items: 3 },
            768: { items: 5 },
            992: { items: 6 }
          }
        });
      } catch (e) {
        // optional carousel, safe to ignore if not present
      }
    }
  }, []);

  // Fetch orders for dropdown (both delivery and pickup)
  const fetchOrders = async () => {
    try {
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

      setTotalOrderCount(allOrders.length);
      setOrders(allOrders.slice(0, 5));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    }
  };

  // Fetch cart for dropdown
  const fetchCart = async () => {
    try {
      const response = await apiGet('/cart');
      if (response.success) {
        setCartItems(response.data?.items || []);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Don't clear cart, just keep empty array
      setCartItems([]);
    }
  };

  // Handle search with debounce
  const handleSearch = async (query, category = selectedCategory) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const params = {
        search: query,
        limit: 10
      };

      if (category && category !== 'All') {
        params.category_id = category;
      }

      const response = await axios.get(`${API_URL}/products/totalProduct`, { params });
      const productsData = response.data?.data || response.data || [];

      // Process products to handle images
      const processedResults = productsData.map(product => {
        let images = [];
        if (product.images) {
          if (Array.isArray(product.images)) {
            images = product.images.filter(img => img && img.trim() !== '');
          } else if (typeof product.images === 'string') {
            images = product.images.split(',').map(img => img.trim()).filter(img => img !== '');
          }
        }

        const normalizedImages = images.map(img => {
          if (!img) return null;
          if (img.startsWith('http://') || img.startsWith('https://')) return img;
          if (img.startsWith('/uploads/')) return `https://al-mubrak-backend.onrender.com${img}`;
          if (img.includes('uploads/')) return `https://al-mubrak-backend.onrender.com/${img.startsWith('/') ? img.slice(1) : img}`;
          return img.startsWith('assets/') ? img : `assets/images/products/${img}`;
        }).filter(img => img !== null);

        return { ...product, images: normalizedImages };
      });

      setSearchResults(processedResults);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  // Render stars based on rating
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="lni lni-star-filled"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="lni lni-star-half"></i>);
      } else {
        stars.push(<i key={i} className="lni lni-star"></i>);
      }
    }

    return stars;
  };



  if (error) {
    return <div className="container py-5 text-center">{error}</div>;
  }

  return (
    <>
      <style>{`
        /* Modern Header Styles */
        .header-middle {
          border-bottom: 1px solid rgba(0,0,0,0.05);
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
          position: sticky;
          top: 0;
          z-index: 999;
          transition: all 0.3s ease;
        }
        .navbar-brand img {
          transition: transform 0.3s ease;
        }
        .navbar-brand:hover img {
          transform: scale(1.05);
        }
        
        /* Modern Search Bar */
        .navbar-search {
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          border: 1px solid #eee !important;
          border-radius: 50px !important;
          padding: 5px;
          background: #fff;
        }
        .navbar-search:focus-within {
          box-shadow: 0 8px 25px rgba(0,123,255,0.15);
          border-color: #007bff !important;
          transform: translateY(-1px);
        }
        .navbar-search .search-input input {
            border-radius: 50px !important;
            padding-left: 20px !important;
        }
        .navbar-search .search-btn button {
            border-radius: 50px !important;
            width: 45px !important;
            height: 45px !important;
            padding: 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Mobile View Refinements */
        @media (max-width: 768px) {
          .header-middle {
            position: relative;
            padding: 10px 0;
          }
          .topbar {
            display: block !important; /* Show topbar text */
            text-align: center;
            padding: 5px 0;
          }
          .topbar .row {
            justify-content: center;
          }
          .topbar .col-lg-6 {
            width: 100%;
            text-align: center;
          }
          .navbar-search {
            display: none !important; /* Hide search on mobile */
          }
          .navbar-brand {
            text-align: center;
            width: 100%;
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }
          .middle-right-area {
            justify-content: center !important;
            margin-top: 0 !important;
          }
        }
        
        .search-results-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 0;
        }
        .search-result-item {
          padding: 15px;
          border-bottom: 1px solid #f5f5f5;
          cursor: pointer;
          transition: background 0.2s;
        }
        .search-result-item:hover {
          background: #f8f9fa;
        }
        .search-result-item:last-child {
          border-bottom: none;
        }
        .search-result-item img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 10px;
        }
      `}</style>
      {/* Preloader */}


      {/* Header Area */}
      <header className="header navbar-area" style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#fff' }}>
        {/* Topbar */}
        <div className="topbar" style={{ padding: '12px 0', borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-6 col-12">
                <div className="welcome-text">
                  <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: 500 }}>
                    <i className="lni lni-cart-full" style={{ color: '#007bff', marginRight: '8px' }}></i>
                    Welcome to Almubarak - Your Premium Online Store
                  </p>
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-12">
                <div className="top-middle">
                  <ul className="useful-links" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <li>
                      <Link to="/" style={{ textDecoration: 'none', color: '#333', fontSize: '13px', transition: 'color 0.3s' }}
                        onMouseEnter={(e) => e.target.style.color = '#007bff'}
                        onMouseLeave={(e) => e.target.style.color = '#333'}>Home</Link>
                    </li>
                    <li>
                      <Link to="/about" style={{ textDecoration: 'none', color: '#333', fontSize: '13px', transition: 'color 0.3s' }}
                        onMouseEnter={(e) => e.target.style.color = '#007bff'}
                        onMouseLeave={(e) => e.target.style.color = '#333'}>About</Link>
                    </li>
                    <li>
                      <Link to="/contact" style={{ textDecoration: 'none', color: '#333', fontSize: '13px', transition: 'color 0.3s' }}
                        onMouseEnter={(e) => e.target.style.color = '#007bff'}
                        onMouseLeave={(e) => e.target.style.color = '#333'}>Contact</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-12">
                <div className="top-end">
                  <ul className="user-login" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', gap: '15px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {currentUser ? (
                      <li>
                        <Link to="/customerProfile" style={{ textDecoration: 'none', color: '#333', fontSize: '13px', transition: 'color 0.3s' }}
                          onMouseEnter={(e) => e.target.style.color = '#007bff'}
                          onMouseLeave={(e) => e.target.style.color = '#333'}>
                          Hi, {currentUser.firstName || 'User'}
                        </Link>
                      </li>
                    ) : (
                      <>
                        <li>
                          <Link to="/login" style={{ textDecoration: 'none', color: '#333', fontSize: '13px', transition: 'color 0.3s' }}
                            onMouseEnter={(e) => e.target.style.color = '#007bff'}
                            onMouseLeave={(e) => e.target.style.color = '#333'}>Sign In</Link>
                        </li>
                        <li>
                          <Link to="/register" style={{ textDecoration: 'none', color: '#333', fontSize: '13px', fontWeight: 600, transition: 'color 0.3s', background: 'rgba(0,0,0,0.05)', padding: '5px 12px', borderRadius: '4px' }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}>Register</Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header Middle */}
        <div className="header-middle" style={{ padding: '15px 0', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-2 col-md-2 col-7">
                <Link className="navbar-brand" to="/" style={{ display: 'block' }}>
                  <img src="assets/images/logo/logo.png" alt="Logo" style={{ maxWidth: '60px', height: 'auto', display: 'block', transition: 'all 0.3s ease' }} />
                </Link>
              </div>
              <div className="col-lg-6 col-md-7 d-xs-none">
                <div className="main-menu-search">
                  <div className="navbar-search search-style-5" style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="search-select">
                      <div className="select-position">
                        <select
                          id="select1"
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            if (searchQuery) {
                              handleSearch(searchQuery, e.target.value);
                            }
                          }}
                          style={{
                            border: 'none',
                            borderRadius: '50px 0 0 50px',
                            padding: '10px 20px',
                            background: '#f8f9fa',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            height: '45px',
                            borderRight: '1px solid #eee'
                          }}
                        >
                          <option value="All">All</option>
                          {categories.map(category => (
                            <option key={category.id || category.category_id} value={category.id || category.category_id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="search-input" style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search for products, brands and more..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        onFocus={() => {
                          if (searchResults.length > 0) setShowSearchResults(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSearchResults(false), 200);
                        }}
                        style={{
                          border: 'none',
                          borderRadius: '0',
                          padding: '10px 15px',
                          width: '100%',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="search-results-dropdown">
                          {searchResults.slice(0, 5).map((product) => {
                            const productId = product.id || product.product_id;
                            const productName = product.name || product.product_name;
                            const productImages = Array.isArray(product.images) ? product.images : [];
                            const imageUrl = productImages.length > 0 && productImages[0]
                              ? (productImages[0].startsWith('/uploads/')
                                ? `https://al-mubrak-backend.onrender.com${productImages[0]}`
                                : productImages[0])
                              : 'assets/images/placeholder.jpg';

                            return (
                              <div
                                key={productId}
                                className="search-result-item"
                                onClick={() => {
                                  navigate(`/shop-list?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
                                  setShowSearchResults(false);
                                }}
                                style={{ display: 'flex', alignItems: 'center' }}
                              >
                                <img src={imageUrl} alt={productName} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{productName}</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>${parseFloat(product.price || 0).toFixed(2)}</div>
                                </div>
                              </div>
                            );
                          })}
                          {searchResults.length > 5 && (
                            <div
                              className="search-result-item"
                              onClick={() => {
                                navigate(`/shop-list?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
                                setShowSearchResults(false);
                              }}
                              style={{ textAlign: 'center', fontWeight: 'bold', color: '#007bff' }}
                            >
                              View all {searchResults.length} results
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="search-btn">
                      <button
                        onClick={() => {
                          if (searchQuery) {
                            navigate(`/shop-list?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
                          }
                        }}
                        style={{
                          border: 'none',
                          background: '#007bff',
                          color: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 10px rgba(0,123,255,0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#0056b3';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#007bff';
                          e.target.style.transform = 'scale(1)';
                        }}>
                        <i className="lni lni-search-alt" style={{ fontSize: '18px' }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-3 col-5">
                <div className="middle-right-area" style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {currentUser && (
                    <div className="navbar-cart" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      {/* Orders Icon with Dropdown */}
                      <div
                        className="orders-dropdown-wrapper"
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setShowOrdersDropdown(true)}
                        onMouseLeave={() => setShowOrdersDropdown(false)}
                      >
                        <Link
                          to="/allOrders"
                          style={{ position: 'relative', color: '#667eea', fontSize: '22px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                        >
                          <i className="lni lni-clipboard"></i>
                          {totalOrderCount > 0 && (
                            <span className="total-items" style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}>{totalOrderCount}</span>
                          )}
                        </Link>

                        {showOrdersDropdown && totalOrderCount > 0 && (
                          <div className="dropdown-content" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '10px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            padding: '15px',
                            minWidth: '280px',
                            zIndex: 1000,
                            animation: 'fadeIn 0.3s ease'
                          }}>
                            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' }}>
                              <strong style={{ color: '#1f2937', fontSize: '0.95rem' }}>Recent Orders ({totalOrderCount})</strong>
                            </div>
                            {orders.map((order, idx) => (
                              <div key={idx} style={{
                                padding: '10px',
                                borderBottom: idx < orders.length - 1 ? '1px solid #f3f4f6' : 'none',
                                fontSize: '0.85rem'
                              }}>
                                <div style={{ fontWeight: '600', color: '#667eea' }}>#{order.order_id}</div>
                                <div style={{ color: '#6b7280', marginTop: '3px' }}>{order.status || 'Pending'}</div>
                              </div>
                            ))}
                            <Link
                              to="/allOrders"
                              style={{
                                display: 'block',
                                textAlign: 'center',
                                marginTop: '10px',
                                padding: '8px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                              }}
                            >
                              View All Orders
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Cart Icon with Dropdown */}
                      <div
                        className="cart-dropdown-wrapper"
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setShowCartDropdown(true)}
                        onMouseLeave={() => setShowCartDropdown(false)}
                      >
                        <Link
                          to="/cart"
                          style={{ position: 'relative', color: '#667eea', fontSize: '22px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                        >
                          <i className="lni lni-cart"></i>
                          {cartItems.length > 0 && (
                            <span className="total-items" style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}>{cartItems.length}</span>
                          )}
                        </Link>

                        {showCartDropdown && cartItems.length > 0 && (
                          <div className="dropdown-content" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '10px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            padding: '15px',
                            minWidth: '280px',
                            zIndex: 1000,
                            animation: 'fadeIn 0.3s ease'
                          }}>
                            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' }}>
                              <strong style={{ color: '#1f2937', fontSize: '0.95rem' }}>Cart Items ({cartItems.length})</strong>
                            </div>
                            {cartItems.slice(0, 3).map((item, idx) => (
                              <div key={idx} style={{
                                padding: '10px',
                                borderBottom: idx < Math.min(cartItems.length, 3) - 1 ? '1px solid #f3f4f6' : 'none',
                                fontSize: '0.85rem'
                              }}>
                                <div style={{ fontWeight: '600', color: '#1f2937' }}>{item.product_name || item.name}</div>
                                <div style={{ color: '#6b7280', marginTop: '3px' }}>Qty: {item.quantity}</div>
                              </div>
                            ))}
                            <Link
                              to="/cart"
                              style={{
                                display: 'block',
                                textAlign: 'center',
                                marginTop: '10px',
                                padding: '8px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                              }}
                            >
                              View Cart
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Profile Icon with Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div className="user-info-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="user-avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                              <img
                                src={currentUser.profile_image ? (currentUser.profile_image.startsWith('http') ? currentUser.profile_image : `${FILE_BASE_URL}${currentUser.profile_image}`) : 'assets/images/noavata.png'}
                                alt="User"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
                              {currentUser.firstName || currentUser.name || 'User'}
                            </span>
                            <i className="lni lni-chevron-down" style={{ fontSize: '12px', color: '#fff' }}></i>
                          </div>      </button>

                        {showProfileDropdown && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            minWidth: '200px',
                            zIndex: 1000,
                            overflow: 'hidden'
                          }}>
                            <Link
                              to="/customerProfile"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                textDecoration: 'none',
                                color: '#333',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                              onClick={() => setShowProfileDropdown(false)}
                            >
                              <i className="lni lni-user" style={{ fontSize: '18px', color: '#667eea' }}></i>
                              <span style={{ fontWeight: '500' }}>Update Profile</span>
                            </Link>
                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                handleLogout();
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#dc3545',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                              <i className="lni lni-exit" style={{ fontSize: '18px' }}></i>
                              <span style={{ fontWeight: '500' }}>Logout</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Header Bottom */}
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 col-md-6 col-12">
              <div className="nav-inner">
                <div className="mega-category-menu">
                  <span className="cat-button">
                    <i className="lni lni-menu"></i>All Categories
                  </span>
                  <ul className="sub-category">
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <li key={category.id || category.category_id}>
                          <Link to={`/product-grids?category=${category.id || category.category_id}`}>
                            {category.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <Link to="/product-grids">All Products</Link>
                      </li>
                    )}
                  </ul>
                </div>
                <nav className="navbar navbar-expand-lg">
                  <button
                    className="navbar-toggler mobile-menu-btn"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse sub-menu-bar" id="navbarSupportedContent">
                    <ul id="nav" className="navbar-nav ms-auto">
                      <li className="nav-item">
                        <Link to="/" className="active" aria-label="Toggle navigation">
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <a
                          className="dd-menu collapsed"
                          href="javascript:void(0)"
                          data-bs-toggle="collapse"
                          data-bs-target="#submenu-1-2"
                          aria-controls="navbarSupportedContent"
                          aria-expanded="false"
                          aria-label="Toggle navigation"
                        >
                          Pages
                        </a>
                        <ul className="sub-menu collapse" id="submenu-1-2">
                          <li className="nav-item">
                            <Link to="/about">About Us</Link>
                          </li>
                          <li className="nav-item">
                            <Link to="/faq">Faq</Link>
                          </li>
                          <li className="nav-item">
                            <Link to="/login">Login</Link>
                          </li>
                          <li className="nav-item">
                            <Link to="/register">Register</Link>
                          </li>
                          <li className="nav-item">
                            <Link to="/mail-success">Mail Success</Link>
                          </li>
                          <li className="nav-item">
                            <Link to="/404">404 Error</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="nav-item">
                        <a
                          className="dd-menu collapsed"
                          href="javascript:void(0)"
                          data-bs-toggle="collapse"
                          data-bs-target="#submenu-1-3"
                          aria-controls="navbarSupportedContent"
                          aria-expanded="false"
                          aria-label="Toggle navigation"
                        >
                          Branches
                        </a>
                        <ul className="sub-menu collapse" id="submenu-1-3">
                          <li className="nav-item">
                            <Link to="/product-grids?branch=medile branch">Medile Branch</Link>
                          </li>
                          <li className="nav-item">
                            <Link to="/product-grids?branch=bakin asibit branch">Bakin Asibiti Branch</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="nav-item">
                        <Link to="/contact" aria-label="Toggle navigation">
                          Contact Us
                        </Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <div className="nav-social">
                <h5 className="title">Follow Us:</h5>
                <ul>
                  <li>
                    <a href="javascript:void(0)">
                      <i className="lni lni-facebook-filled"></i>
                    </a>
                  </li>
                  <li>
                    <a href="javascript:void(0)">
                      <i className="lni lni-twitter-original"></i>
                    </a>
                  </li>
                  <li>
                    <a href="javascript:void(0)">
                      <i className="lni lni-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="javascript:void(0)">
                      <i className="lni lni-skype"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Area */}
      <section className="hero-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-12 custom-padding-right">
              <div className="slider-head">
                <div className="hero-slider">
                  {HERO_IMAGES.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="single-slider"
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        position: 'relative',
                        minHeight: '500px'
                      }}
                    >
                      <div className="content" style={{
                        padding: '40px',
                        borderRadius: '15px',
                        color: '#fff',
                        maxWidth: '600px',
                        position: 'relative',
                        zIndex: 2
                      }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '15px',
                          background: 'rgba(255,255,255,0.2)',
                          padding: '5px 15px',
                          borderRadius: '20px',
                          backdropFilter: 'blur(5px)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          Shop the Best Deals
                        </span>
                        <h2 style={{
                          color: '#fff',
                          marginBottom: '20px',
                          fontSize: '42px',
                          fontWeight: '800',
                          lineHeight: '1.2',
                          textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}>
                          Discover Premium <br />
                          <span style={{ color: '#4facfe' }}>Lifestyle Products</span>
                        </h2>
                        <p style={{
                          color: 'rgba(255,255,255,0.9)',
                          marginBottom: '30px',
                          fontSize: '16px',
                          lineHeight: '1.6',
                          maxWidth: '450px'
                        }}>
                          Explore our curated collection of high-quality items designed to elevate your everyday life.
                        </p>
                        <div className="button">
                          <Link to="/shop-list" className="btn" style={{
                            background: '#007bff',
                            color: '#fff',
                            padding: '15px 35px',
                            borderRadius: '30px',
                            textDecoration: 'none',
                            display: 'inline-block',
                            transition: 'all 0.3s ease',
                            fontWeight: '600',
                            boxShadow: '0 5px 15px rgba(0,123,255,0.4)',
                            border: '2px solid transparent'
                          }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.borderColor = '#fff';
                              e.target.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#007bff';
                              e.target.style.borderColor = 'transparent';
                              e.target.style.transform = 'translateY(0)';
                            }}>
                            Shop Collection
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-12">
              <div className="row">
                {HERO_IMAGES.slice(0, 2).map((imageUrl, index) => (
                  <div key={index} className={`col-lg-12 col-md-6 col-12 ${index === 1 ? '' : 'md-custom-padding'}`}>
                    <div
                      className={`hero-small-banner ${index === 1 ? 'style2' : ''}`}
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '240px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginTop: index === 1 ? '15px' : '0'
                      }}
                    >
                      <div className="content" style={{
                        background: 'rgba(0,0,0,0.6)',
                        padding: '20px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>
                          {index === 0 && <span style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Featured</span>}
                          Healthcare Excellence
                        </h2>
                        {index === 1 && (
                          <div className="button">
                            <Link className="btn" to="/shop-list" style={{
                              background: '#007bff',
                              color: '#fff',
                              padding: '8px 20px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              display: 'inline-block',
                              transition: 'background 0.3s'
                            }}
                              onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                              onMouseLeave={(e) => e.target.style.background = '#007bff'}>
                              Shop Now
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Product Area */}
      <section className="trending-product section" style={{ marginTop: "12px" }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section-title">
                <h2>Trending Product</h2>
                <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @media (max-width: 768px) {
            .orders-dropdown-wrapper .dropdown-content,
            .cart-dropdown-wrapper .dropdown-content {
              position: fixed !important;
              top: 60px !important;
              left: 10px !important;
              right: 10px !important;
              width: auto !important;
              min-width: 0 !important;
              max-height: 80vh;
              overflow-y: auto;
            }
            
            .middle-right-area {
              justify-content: center !important;
              margin-top: 10px;
            }
          }
        `}</style>
                <p>
                  Explore a thoughtfully curated collection of beauty essentials designed to enhance your natural glow. At Almubarak Cosmetics, we bring you quality, elegance, and confidence—beautifully delivered
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {products.length > 0 ? (
              products.slice(0, 8).map((product) => {
                const productId = product.id || product.product_id;
                const productName = product.name || product.product_name;
                const productImages = Array.isArray(product.images) ? product.images : [];
                let imageUrl = productImages.length > 0 && productImages[0] ? productImages[0] : 'assets/images/placeholder.jpg';

                // Ensure image URL is properly formatted
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/') && !imageUrl.startsWith('assets/')) {
                  if (imageUrl.includes('uploads/')) {
                    imageUrl = `http://localhost:3000/${imageUrl}`;
                  } else {
                    imageUrl = `assets/images/products/${imageUrl}`;
                  }
                }

                const categoryName = product.categoryName || product.category || 'Uncategorized';

                return (
                  <div className="col-lg-3 col-md-6 col-12" key={productId}>
                    <div className="single-product" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div className="product-image" style={{
                        position: 'relative',
                        overflow: 'hidden',
                        height: '280px',
                        minHeight: '280px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f9fa',
                        borderRadius: '8px 8px 0 0'
                      }}
                        onMouseEnter={(e) => {
                          const button = e.currentTarget.querySelector('.button');
                          if (button) button.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          const button = e.currentTarget.querySelector('.button');
                          if (button) button.style.opacity = '0';
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={productName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'assets/images/placeholder.jpg';
                            // If placeholder also fails, use a data URI for a simple placeholder
                            if (e.target.src.includes('placeholder.jpg')) {
                              e.target.onerror = () => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                if (parent && !parent.querySelector('.image-placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'image-placeholder';
                                  placeholder.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 14px;';
                                  placeholder.textContent = 'No Image';
                                  parent.appendChild(placeholder);
                                }
                              };
                            }
                          }}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            padding: '15px',
                            display: 'block'
                          }}
                        />
                        <div className="button" style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          zIndex: 10
                        }}>
                          <Link to={`/product/${productId}`} className="btn" style={{
                            background: '#007bff',
                            color: '#fff',
                            padding: '8px 15px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}>
                            <i className="lni lni-cart"></i> Add to Cart
                          </Link>
                        </div>
                      </div>
                      <div className="product-info" style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span className="category" style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{categoryName}</span>
                        <h4 className="title" style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                          <Link to={`/product/${productId}`} style={{ color: '#333', textDecoration: 'none' }}>
                            {productName}
                          </Link>
                        </h4>
                        <ul className="review" style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {renderRating(parseInt(product.rating || 0))}
                          <li>
                            <span style={{ fontSize: '12px', color: '#666' }}>
                              ({product.rating || 0})
                            </span>
                          </li>
                        </ul>
                        <div className="price" style={{ marginTop: 'auto' }}>
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                            ₦{parseFloat(product.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <p>No products available</p>
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-12 text-center" style={{ marginTop: '40px' }}>
              <Link 
                to="/shop-list" 
                className="btn" 
                style={{
                  padding: '12px 35px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 8px 15px rgba(0,123,255,0.2)',
                  transition: 'all 0.3s ease',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,123,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,123,255,0.2)';
                }}
              >
                View All Products <i className="lni lni-arrow-right" style={{ marginLeft: '10px' }}></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call Action */}
      <section className="call-action section">
        <div className="container">
          <div className="row ">
            <div className="col-lg-8 offset-lg-2 col-12">
              <div className="inner">
                <div className="content">
                  <h2 className="wow fadeInUp" data-wow-delay=".4s">
                    Get the Best Deals
                    <br /> on Almubarak
                  </h2>
                  <p className="wow fadeInUp" data-wow-delay=".6s">
                    Shop now and enjoy exclusive offers and discounts.
                  </p>
                  <div className="button wow fadeInUp" data-wow-delay=".8s">
                    <Link to="/shop-list" className="btn">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Area */}
      <section className="banner section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-12">
              <div
                className="single-banner"
                style={{
                  backgroundImage: 'url(assets/images/banner/aa.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="content">
                  <h2>Premium Collection</h2>
                  <p>
                    Discover our exclusive range of premium products
                  </p>
                  <div className="button">
                    <Link to="/shop-list" className="btn">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div
                className="single-banner custom-responsive-margin"
                style={{
                  backgroundImage: 'url(assets/images/banner/bb.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="content">
                  <h2>New Arrivals</h2>
                  <p>
                    Check out our latest products and special offers
                  </p>
                  <div className="button">
                    <Link to="/shop-list" className="btn">
                      Explore Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="shipping-info">
        <div className="container">
          <ul>
            <li>
              <div className="media-icon">
                <i className="lni lni-delivery"></i>
              </div>
              <div className="media-body">
                <h5>Free Shipping</h5>
                <span>On order over $99</span>
              </div>
            </li>
            <li>
              <div className="media-icon">
                <i className="lni lni-support"></i>
              </div>
              <div className="media-body">
                <h5>24/7 Support.</h5>
                <span>Live Chat Or Call.</span>
              </div>
            </li>
            <li>
              <div className="media-icon">
                <i className="lni lni-credit-cards"></i>
              </div>
              <div className="media-body">
                <h5>Online Payment.</h5>
                <span>Secure Payment Services.</span>
              </div>
            </li>
            <li>
              <div className="media-icon">
                <i className="lni lni-reload"></i>
              </div>
              <div className="media-body">
                <h5>Easy Return.</h5>
                <span>Hassle Free Shopping.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="container">
            <div className="inner-content">
              <div className="row">
                <div className="col-lg-3 col-md-4 col-12">
                  <div className="footer-logo">
                    <Link to="/">
                      <img src="assets/images/logo/logo.png" alt="#" />
                    </Link>
                  </div>
                </div>
                <div className="col-lg-9 col-md-8 col-12">
                  <div className="footer-newsletter">
                    <h4 className="title">
                      Subscribe to our Newsletter
                      <span>Get all the latest information, Sales and Offers.</span>
                    </h4>
                    <div className="newsletter-form-head">
                      <form action="#" method="get" target="_blank" className="newsletter-form">
                        <input name="EMAIL" placeholder="Email address here..." type="email" />
                        <div className="button">
                          <button className="btn">
                            Subscribe<span className="dir-part"></span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-middle">
          <div className="container">
            <div className="bottom-inner">
              <div className="row">
                <div className="col-lg-3 col-md-6 col-12">
                  <div className="single-footer f-contact">
                    <h3>Get In Touch With Us</h3>
                    <p className="phone">Phone: +234 806 160 5271</p>
                    <ul>
                      <li>
                        <span>AL Days</span> 8:00 am - 7:00 pm
                      </li>
                      <li>
                        <span>Friday: </span> 8:00 am - 5:00 pm
                      </li>
                    </ul>
                    <p className="mail">
                      <a href="mailto:no-reply@almubarakcosmetics.com.ng">support@almubarakcosmetics.com</a>
                    </p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-12">
                  <div className="single-footer our-app">
                    <h3>Our Mobile App</h3>
                    <ul className="app-btn">
                      <li>
                        <a href="javascript:void(0)">
                          <i className="lni lni-apple"></i>
                          <span className="small-title">Download on the</span>
                          <span className="big-title">App Store</span>
                        </a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">
                          <i className="lni lni-play-store"></i>
                          <span className="small-title">Download on the</span>
                          <span className="big-title">Google Play</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-12">
                  <div className="single-footer f-link">
                    <h3>Information</h3>
                    <ul>
                      <li>
                        <a href="javascript:void(0)">About Us</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">Contact Us</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">Downloads</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">Sitemap</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">FAQs Page</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-12">
                  <div className="single-footer f-link">
                    <h3>Shop Departments</h3>
                    <ul>
                      <li>
                        <a href="javascript:void(0)">Shampoo & Conditioner</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">Lotion & Body Wash</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">Perfume & Cologne</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">Shower Gel & Body Scrub</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)">Deodorant & After Shave</a>
                      </li>
                      <li>
                        <a href="javascript:void(0)"></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="inner-content">
              <div className="row align-items-center">
                <div className="col-lg-4 col-12">
                  <div className="payment-gateway">
                    <span>We Accept:</span>
                    <img src="assets/images/footer/credit-cards-footer.png" alt="#" />
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="copyright">
                    <p>
                      Designed and Developed by
                      <a href="https://bashfortech.onrender.com" rel="nofollow" target="_blank" >
                        Almubarak Team
                      </a>
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <ul className="socila">
                    <li>
                      <span>Follow Us On:</span>
                    </li>
                    <li>
                      <a href="javascript:void(0)">
                        <i className="lni lni-facebook-filled"></i>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0)">
                        <i className="lni lni-twitter-original"></i>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0)">
                        <i className="lni lni-instagram"></i>
                      </a>
                    </li>
                    <li>
                      <a href="javascript:void(0)">
                        <i className="lni lni-google"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll Top */}
      <a href="#" className="scroll-top">
        <i className="lni lni-chevron-up"></i>
      </a>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <i className="lni lni-warning" style={{
                fontSize: '48px',
                color: '#f59e0b',
                marginBottom: '15px'
              }}></i>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Confirm Logout</h3>
              <p style={{ margin: 0, color: '#666' }}>Are you sure you want to logout?</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '10px 24px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#666',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Responsive Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .orders-dropdown-wrapper .dropdown-content,
          .cart-dropdown-wrapper .dropdown-content {
            position: fixed !important;
            top: 60px !important;
            left: 10px !important;
            right: 10px !important;
            width: auto !important;
            min-width: 0 !important;
            max-height: 80vh;
            overflow-y: auto;
          }
          
          .middle-right-area {
            justify-content: center !important;
            margin-top: 10px;
          }
        }
      `}</style>
    </>
  );
}


