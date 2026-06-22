import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { apiGet, apiPost, FILE_BASE_URL } from "../utils/api";
import { AuthContext } from "../context/AuthContext";

dayjs.extend(relativeTime);

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatPrice = (value) => {
  if (typeof value !== "number") return "";
  return nairaFormatter.format(value);
};

const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) return `${FILE_BASE_URL}${path}`;
  return path;
};

const buildPlaceholder = (text) => {
  return "IB";
  return text
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

const buildProductImage = (product) => {
  if (!product) return null;
  const image = product.image || (Array.isArray(product.images) ? product.images[0] : product.images);
  return resolveImage(image);
};

export default function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);



  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!productId) {
          throw new Error("Missing product reference");
        }
        // Fetch product details
        const productResponse = await apiGet(`/products/product/${productId}`);

        if (cancelled) return;

        const productPayload = productResponse?.data || productResponse;

        if (!productPayload) {
          throw new Error("Product data not found");
        }

        setProduct(productPayload);
        setActiveImage(0);

        // Fetch related products (same category or random)
        try {
          const relatedResponse = await apiGet("/products/totalProduct", {
            limit: 4,
            random: true,
            category_id: productPayload.categoryId
          });

          const relatedItems = relatedResponse?.data || [];
          setRelatedProducts(
            relatedItems.filter((item) => (item.id || item.product_id) !== (productPayload.id || productPayload.product_id))
          );
        } catch (relatedError) {
          console.warn("Failed to load related products", relatedError);
          setRelatedProducts([]);
        }

      } catch (error) {
        console.error("Failed to load product:", error.message);
        if (!cancelled) {
          setToast({ type: "error", message: error.message || "Product not found" });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(resolveImage).filter(Boolean);
    }
    if (product.image) return [resolveImage(product.image)].filter(Boolean);
    return [];
  }, [product]);

  const handleQuantityChange = (direction) => {
    setQuantity((prev) => {
      const next = direction === "up" ? prev + 1 : prev - 1;
      return Math.max(1, next);
    });
  };

  const handleAddToCart = async () => {

    if (!product) return;
    try {
      setAdding(true);
      await apiPost("/cart/add", {
        productId: product.id || product.product_id,
        quantity,
      });
      setToast({ type: "success", message: "Product successfully added to cart!" });
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Unable to update cart",
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-shell loading">
        <div className="loader">Loading product…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-shell empty">
        <p>We couldn’t find that product.</p>
        <Link to="/shop-grids" className="btn">
          Browse catalogue
        </Link>
      </div>
    );
  }

  const currentImage = galleryImages[activeImage];

  return (
    <>
      <section className="product-detail-shell">
        <div className="product-detail-grid">
          <div className="product-media">
            <div className="product-media__stage">
              {currentImage ? (
                <img src={currentImage} alt={product.title || product.nameEn} />
              ) : (
                <div className="product-media__placeholder">
                  {buildPlaceholder(product.title || product.name || "Product")}
                </div>
              )}
            </div>
            <div className="product-media__thumbs">
              {galleryImages.length === 0 && (
                <div className="product-media__thumb placeholder">
                  {buildPlaceholder(product.title || product.name)}
                </div>
              )}
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  className={`product-media__thumb ${index === activeImage ? "active" : ""
                    }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`Variation ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info-panel">
            <span className="product-pill">
              {product.categoryName || product.category || "Catalogue"}
            </span>
            <h1>{product.title || product.product_name || product.name || "Product"}</h1>
            <p className="product-meta">
              Last updated {dayjs(product.updatedAt || product.created_at).fromNow()}
            </p>
            <div className="product-price">
              <strong>{formatPrice((product.finalPrice || product.price) * quantity)}</strong>
              {product.priceWithTax && product.priceWithTax !== product.price && (
                <span>inc. tax {formatPrice(product.priceWithTax * quantity)}</span>
              )}
            </div>
            <p className="product-description">
              {product.description ||
                product.shortDescEn ||
                "Experience premium sourcing from our Medile and Bakin Asibiti branches."}
            </p>

            <div className="product-actions">
              <div className="quantity-control">
                <button type="button" onClick={() => handleQuantityChange("down")}>
                  −
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => handleQuantityChange("up")}>
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? "Adding…" : "Add to cart"}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/cart")}
              >
                View cart
              </button>
            </div>

            <div className="product-attributes">
              <div>
                <span>Branch</span>
                <strong className="text-capitalize">{product.branch || "Nationwide"}</strong>
              </div>
              <div>
                <span>Rating</span>
                <strong>{Number(product.rating || 0).toFixed(1)} / 5</strong>
              </div>
              <div>
                <span>Stock</span>
                <strong>{product.stock ?? "In store"}</strong>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <div className="related-header">
              <h2>Customers also explored</h2>
              <Link to="/shop-grids" className="link">
                See all
              </Link>
            </div>
            <div className="related-grid">
              {relatedProducts.map((item) => {
                const image = buildProductImage(item);
                return (
                  <div className="related-card" key={item.id}>
                    <div className="related-card__media">
                      {image ? (
                        <img src={image} alt={item.product_name || item.name} />
                      ) : (
                        <div className="related-card__placeholder">
                          {buildPlaceholder(item.product_name || item.name)}
                        </div>
                      )}
                    </div>
                    <div className="related-card__body">
                      <span>{item.categoryName || item.category || "Catalogue"}</span>
                      <h3>{item.product_name || item.name}</h3>
                      <p>{formatPrice(item.price)}</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/product-detail?id=${item.id}`)}
                      >
                        View product
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {toast && (
        <div className={`auth-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button type="button" className="toast-close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      <style>{`
        .product-detail-shell {
          padding: 80px 20px;
          background: #f8fafc;
          min-height: 100vh;
        }
        .product-detail-shell.loading,
        .product-detail-shell.empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        .product-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1100px;
          margin: 0 auto;
          background: #fff;
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.1);
        }
        .product-media {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .product-media__stage {
          border-radius: 1.25rem;
          overflow: hidden;
          background: #0f172a;
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-media__stage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-media__placeholder {
          width: 100%;
          height: 100%;
          font-size: 3rem;
          color: #fff;
        }
        .product-media__thumbs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 0.75rem;
        }
        .product-media__thumb {
          border: 2px solid transparent;
          border-radius: 0.75rem;
          overflow: hidden;
          padding: 0;
          background: transparent;
          cursor: pointer;
        }
        .product-media__thumb.active {
          border-color: #312e81;
        }
        .product-media__thumb img,
        .product-media__thumb.placeholder {
          width: 100%;
          height: 72px;
          object-fit: cover;
          display: block;
        }
        .product-media__thumb.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          color: #fff;
          font-weight: 600;
        }
        .product-info-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .product-pill {
          align-self: flex-start;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          background: rgba(49, 46, 129, 0.1);
          color: #312e81;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .product-info-panel h1 {
          margin: 0;
          font-size: 2.3rem;
          color: #0f172a;
        }
        .product-meta {
          margin: 0;
          color: #6b7280;
        }
        .product-price {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .product-price strong {
          font-size: 2rem;
          color: #111827;
        }
        .product-price span {
          color: #6b7280;
        }
        .product-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          align-items: center;
        }
        .quantity-control {
          display: inline-flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
        }
        .quantity-control button {
          border: none;
          background: transparent;
          width: 40px;
          height: 40px;
          font-size: 1.25rem;
          cursor: pointer;
        }
        .quantity-control span {
          width: 48px;
          text-align: center;
          font-weight: 600;
        }
        .product-attributes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .product-attributes span {
          font-size: 0.82rem;
          color: #6b7280;
        }
        .product-attributes strong {
          display: block;
          color: #111827;
        }
        .btn {
          border: none;
          border-radius: 0.75rem;
          padding: 0.85rem 1.5rem;
          cursor: pointer;
          font-weight: 600;
        }
        .btn.primary {
          background: linear-gradient(135deg, #312e81, #1e3a8a);
          color: #fff;
        }
        .btn.ghost {
          background: rgba(15, 23, 42, 0.06);
          color: #0f172a;
        }
        .related-products {
          max-width: 1100px;
          margin: 3rem auto 0;
        }
        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .related-card {
          background: #fff;
          border-radius: 1rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
        }
        .related-card__media img,
        .related-card__placeholder {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }
        .related-card__placeholder {
          background: linear-gradient(135deg, #0f172a, #312e81);
          color: #fff;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .related-card__body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .related-card__body button {
          margin-top: 0.5rem;
          border: none;
          background: rgba(15, 23, 42, 0.08);
          padding: 0.6rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr;
            padding: 1.5rem;
            gap: 1.5rem;
          }
          .product-media__stage {
            min-height: 260px;
          }
          .product-info-panel h1 {
            font-size: 1.75rem;
          }
          .product-price strong {
            font-size: 1.5rem;
          }
        }

        /* Toast Notifications */
        .auth-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          animation: slideInRight 0.3s ease-out;
          min-width: 300px;
          max-width: 400px;
        }

        .auth-toast.success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
        }

        .auth-toast.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
        }

        .auth-toast span {
          flex: 1;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .toast-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
          padding: 0;
          line-height: 1;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .auth-toast {
            top: 10px;
            right: 10px;
            left: 10px;
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
}


