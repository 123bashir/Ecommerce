import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaInfoCircle, FaUsers, FaBoxOpen, FaAward, FaEnvelope } from "react-icons/fa";

export default function About() {
  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hide");
      preloader.style.display = "none";
    }
  }, []);

  return (
    <>
      <div className="about-container">
        {/* Header Section */}
        <div className="about-header">
          <div className="container">
            <div className="header-content">
              <div className="breadcrumb-section">
                <Link to="/" className="breadcrumb-link">
                  <FaHome /> Home
                </Link>
                <span className="separator">/</span>
                <span className="current">About Us</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-content">
          <div className="container">
            <h1 className="page-title">
              <FaInfoCircle /> About Our Store
            </h1>

            <p className="page-subtitle">
              We are your trusted online marketplace for top-quality products and seamless shopping experiences.
            </p>

            <div className="about-grid">
              <div className="about-card main-info">
                <h2>Who We Are</h2>
                <p>
                  Our e-commerce platform was built with one goal — to make online
                  shopping simple, affordable, and enjoyable. We offer a wide
                  variety of products, from fashion to electronics, at unbeatable
                  prices.
                </p>
                <p>
                  We believe in providing our customers with quality, reliability,
                  and trust. Every purchase is backed by secure payment methods,
                  fast delivery, and exceptional customer service.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <h3>10k+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaBoxOpen />
                  </div>
                  <h3>5k+</h3>
                  <p>Products Available</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaAward />
                  </div>
                  <h3>50+</h3>
                  <p>Trusted Brands</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-top">
            <div className="container text-center">
              <h4>Subscribe to our Newsletter</h4>
              <p>Stay updated with our latest deals and offers.</p>
              <form className="newsletter-form">
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input type="email" placeholder="Enter your email" />
                </div>
                <button className="btn-subscribe">Subscribe</button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="container text-center">
              <p>© {new Date().getFullYear()} Almubarak Cosmetics. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .about-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          flex-direction: column;
        }

        .about-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
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

        .about-content {
          padding: 60px 0;
          flex: 1;
        }

        .page-title {
          text-align: center;
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          animation: fadeInDown 0.6s ease;
        }

        .page-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 1.1rem;
          max-width: 700px;
          margin: 0 auto 50px;
          line-height: 1.6;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 30px;
          align-items: start;
        }

        .about-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }

        .about-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        }

        .about-card h2 {
          font-size: 1.8rem;
          color: #1f2937;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 15px;
        }

        .about-card h2::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
        }

        .about-card p {
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 20px;
          font-size: 1.05rem;
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .stat-card h3 {
          font-size: 2rem;
          color: #1f2937;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .stat-card p {
          color: #6b7280;
          font-weight: 500;
        }

        .footer {
          background: #1f2937;
          color: #f3f4f6;
          padding-top: 60px;
          margin-top: auto;
        }

        .footer h4 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: white;
        }

        .footer p {
          color: #9ca3af;
          margin-bottom: 30px;
        }

        .newsletter-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          gap: 10px;
        }

        .input-group {
          flex: 1;
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .newsletter-form input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s;
        }

        .newsletter-form input:focus {
          outline: none;
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
        }

        .btn-subscribe {
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-subscribe:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          margin-top: 40px;
          padding: 20px 0;
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

        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .stat-card {
            flex: 1;
            min-width: 150px;
          }
          
          .newsletter-form {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
