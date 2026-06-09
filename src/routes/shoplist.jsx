import React, { useEffect, useState, useContext } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import { apiPost } from "../utils/api";

// Development API URL

const API_URL = 'https://api.almubarakcosmetics.com.ng/api'


export default function ShopList() {
  const { currentUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedBranch, setSelectedBranch] = useState(searchParams.get('branch') || '');
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hide");
      preloader.style.display = "none";
    }

    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Update local states from URL search params
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'All';
    const branch = searchParams.get('branch') || '';
    
    setSearchQuery(search);
    setSelectedCategory(category);
    setSelectedBranch(branch);
    
    // Refetch products when search params change
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/`);
      setCategories(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};

      const search = searchParams.get('search');
      const category = searchParams.get('category');
      const branch = searchParams.get('branch');

      if (search) params.search = search;
      if (category && category !== 'All') params.category_id = category;
      if (branch) params.branch = branch;

      const response = await axios.get(`${API_URL}/products/totalProduct`, { params });
      const productsData = response.data?.data || response.data || [];

      // Process products to handle images properly
      const processedProducts = productsData.map(product => {
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

      setProducts(processedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Use a timeout for debouncing search
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Set new timeout to update URL (which triggers fetchProducts)
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      navigate(`/shop-list?${params.toString()}`, { replace: true });
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
  };

  const handleCategoryChange = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId && categoryId !== 'All') {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    navigate(`/shop-list?${params.toString()}`);
  };

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    if (!currentUser) {
      setToast({ type: 'error', message: "Login first please" });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      setAddingToCart(product.id || product.product_id);
      await apiPost("/cart/add", {
        productId: product.id || product.product_id,
        quantity: 1,
      });
      setToast({ type: 'success', message: "Added to cart successfully!" });
    } catch (err) {
      console.error("Error adding to cart:", err);
      setToast({ type: 'error', message: err.message || "Failed to add to cart" });
    } finally {
      setAddingToCart(null);
    }
  };

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

  // We don't want to block the whole UI if already have products, 
  // but for initial load or full refreshes, we can show a nice loader.
  // Actually, let's just use the integrated loader below for a smoother feel.


  return (
    <>
      <style>{`
        .shop-list-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          color: #fff;
          text-align: center;
        }
        .shop-list-filters {
          background: #f8f9fa;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        .filter-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: center;
        }
        .filter-group select,
        .filter-group input {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          padding: 20px 0;
        }
        .product-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          transition: all 0.3s ease;
        }
        .product-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .product-image {
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          position: relative;
        }
        .product-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 15px;
        }
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
          }
          .product-image {
            height: 200px;
          }
          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-group select,
          .filter-group input {
            width: 100%;
          }
        }
      `}</style>

      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{
              width: '60px',
              height: '60px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h3 style={{ color: '#007bff', fontWeight: '600' }}>Loading Products...</h3>
            <p style={{ color: '#666' }}>Please wait while we fetch the best for you</p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div className="preloader" style={{ display: 'none' }}>
        <div className="preloader-inner">
          <div className="preloader-icon">
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: toast.type === 'error' ? '#dc3545' : '#28a745',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <i className={`lni ${toast.type === 'error' ? 'lni-close' : 'lni-checkmark-circle'}`}></i>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="shop-list-header">
        <h1>Our Products</h1>
        <p>Browse our wide range of Blouse and Cosmetics products</p>
      </div>

      <div className="shop-list-filters">
        <div className="container">
          <div className="filter-group">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{ minWidth: '200px' }}
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category.id || category.category_id} value={category.id || category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <select
              value={selectedBranch}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('branch', e.target.value);
                } else {
                  params.delete('branch');
                }
                navigate(`/shop-list?${params.toString()}`);
              }}
              style={{ minWidth: '200px' }}
            >
              <option value="">All Branches</option>
              <option value="medile branch">Medile Branch</option>
              <option value="bakin asibit branch">Bakin Asibiti Branch</option>
            </select>
          </div>
          {(searchQuery || selectedCategory !== 'All' || selectedBranch) && (
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'All' && ` in ${categories.find(c => (c.id || c.category_id) == selectedCategory)?.name || 'category'}`}
              {selectedBranch && ` from ${selectedBranch}`}
            </div>
          )}
        </div>
      </div>

      <section className="section">
        <div className="container">
          {error ? (
            <div className="text-center py-5">{error}</div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => {
                const productId = product.id || product.product_id;
                const productName = product.name || product.product_name;
                const productImages = Array.isArray(product.images) ? product.images : [];
                const imageUrl = productImages.length > 0 && productImages[0]
                  ? (productImages[0].startsWith('/uploads/')
                    ? `https://al-mubrak-backend.onrender.com${productImages[0]}`
                    : productImages[0])
                  : 'assets/images/placeholder.jpg';
                const categoryName = product.categoryName || product.category || 'Uncategorized';

                return (
                  <div key={productId} className="product-card">
                    <div className="product-image">
                      <img
                        src={imageUrl}
                        alt={productName}
                        onError={(e) => {
                          e.target.src = 'assets/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div style={{ padding: '15px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                        {categoryName}
                      </div>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                        <Link to={`/product/${productId}`} style={{ color: '#333', textDecoration: 'none' }}>
                          {productName}
                        </Link>
                      </h4>
                      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {renderRating(parseInt(product.rating || 0))}
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          ({product.rating || 0})
                        </span>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                        ₦{parseFloat(product.price || 0).toFixed(2)}
                      </div>
                      <Link
                        to={`/product/${productId}`}
                        className="btn"
                        style={{
                          display: 'block',
                          marginTop: '15px',
                          textAlign: 'center',
                          background: '#007bff',
                          color: '#fff',
                          padding: '10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                        onMouseLeave={(e) => e.target.style.background = '#007bff'}
                      >
                        View Details
                      </Link>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="btn"
                        disabled={addingToCart === productId}
                        style={{
                          display: 'block',
                          width: '100%',
                          marginTop: '10px',
                          textAlign: 'center',
                          background: '#fff',
                          color: '#007bff',
                          border: '1px solid #007bff',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#007bff';
                          e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fff';
                          e.target.style.color = '#007bff';
                        }}
                      >
                        {addingToCart === productId ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <p>No products found</p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedBranch('');
                    navigate('/shop-list');
                  }}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

