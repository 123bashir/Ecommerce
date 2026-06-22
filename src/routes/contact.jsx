import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaHeadset } from "react-icons/fa";

const BRANCH_ADDRESSES = [
  {
    name: "Medile Branch",
    address: "Sabuwar Gandu, Medile Road, Kano",
    phone: "+234 806 160 5271",
    email: "medile@ibgeneral.ng"
  },
  {
    name: "Bakin Asibiti Branch",
    address: "Gwarzo Road , Bakin Asibiti, Kano",
    phone: "+234 806 160 5271",
    email: "asibiti@ibgeneral.ng"
  }
];

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hide");
      preloader.style.display = "none";
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      setStatus({ type: "error", message: "Kindly complete all the fields." });
      return;
    }
    setStatus({ type: "success", message: "Thanks! We'll be in touch shortly." });
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <>
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <div className="container">
            <div className="header-content">
              <div className="breadcrumb-section">
                <Link to="/" className="breadcrumb-link">
                  <FaHome /> Home
                </Link>
                <span className="separator">/</span>
                <span className="current">Contact Us</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-content">
          <div className="container">
            <h1 className="page-title">
              <FaHeadset /> Let’s Talk
            </h1>

            <p className="page-subtitle">
              Our customer team is available 7 days a week. Reach out and we’ll respond within one business day.
            </p>

            <div className="contact-grid">
              <div className="contact-info-section">
                {BRANCH_ADDRESSES.map((branch) => (
                  <div className="branch-card" key={branch.name}>
                    <h3>{branch.name}</h3>
                    <div className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <p>{branch.address}</p>
                    </div>
                    <div className="info-item">
                      <FaPhone className="info-icon" />
                      <p>{branch.phone}</p>
                    </div>
                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <p>{branch.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-form-card">
                <h3>Send us a message</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="Usman Bilal"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="usmanbilal@gmail.com"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Tell us what you need…"
                      className="form-input"
                    />
                  </div>

                  {status.message && (
                    <div className={`status-message ${status.type}`}>
                      {status.message}
                    </div>
                  )}

                  <button type="submit" className="btn-submit">
                    <FaPaperPlane /> Send Message
                  </button>
                </form>
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
              <p>© {new Date().getFullYear()} IB General Ent. All rights reserved.</p>
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

        .contact-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          flex-direction: column;
        }

        .contact-header {
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

        .contact-content {
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

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 30px;
          align-items: start;
        }

        .contact-info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .branch-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }

        .branch-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        }

        .branch-card h3 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f3f4f6;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          color: #4b5563;
        }

        .info-icon {
          color: #667eea;
          font-size: 1.2rem;
          min-width: 20px;
        }

        .contact-form-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .contact-form-card h3 {
          font-size: 1.8rem;
          color: #1f2937;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #4b5563;
          font-weight: 500;
        }

        .form-input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
          background: #f9fafb;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .status-message {
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 500;
          text-align: center;
        }

        .status-message.success {
          background: #d1fae5;
          color: #065f46;
        }

        .status-message.error {
          background: #fee2e2;
          color: #991b1b;
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
          .contact-grid {
            grid-template-columns: 1fr;
          }
          
          .newsletter-form {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
