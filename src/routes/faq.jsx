import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaQuestionCircle, FaChevronDown, FaChevronUp, FaShoppingBag, FaCreditCard, FaTruck, FaExchangeAlt, FaHeadset, FaEnvelope } from "react-icons/fa";

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hide");
      preloader.style.display = "none";
    }
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      icon: <FaShoppingBag />,
      question: "How do I place an order?",
      answer: "Simply browse through our categories, select the product you want, add it to your cart, and proceed to checkout. You can pay securely using any of our supported payment methods."
    },
    {
      icon: <FaCreditCard />,
      question: "What payment methods do you accept?",
      answer: "We accept debit/credit cards, bank transfers, and wallet payments through trusted gateways such as Monnify and Paystack."
    },
    {
      icon: <FaTruck />,
      question: "How long does delivery take?",
      answer: "Delivery typically takes between 2–5 business days depending on your location. You can track your order through your account dashboard."
    },
    {
      icon: <FaExchangeAlt />,
      question: "What is your return policy?",
      answer: "You can request a return or replacement within 7 days of receiving your order, as long as the item is in its original condition and packaging."
    },
    {
      icon: <FaHeadset />,
      question: "How can I contact support?",
      answer: "Our support team is available 24/7. You can reach us via the contact page or by sending an email to support@almubarak.ng."
    }
  ];

  return (
    <>
      <div className="faq-container">
        {/* Header Section */}
        <div className="faq-header">
          <div className="container">
            <div className="header-content">
              <div className="breadcrumb-section">
                <Link to="/" className="breadcrumb-link">
                  <FaHome /> Home
                </Link>
                <span className="separator">/</span>
                <span className="current">FAQ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-content">
          <div className="container">
            <h1 className="page-title">
              <FaQuestionCircle /> Frequently Asked Questions
            </h1>

            <p className="page-subtitle">
              Find answers to common questions about our store, orders, payments, and delivery.
            </p>

            <div className="faq-grid">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className={`faq-card ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="faq-question">
                    <div className="question-content">
                      <span className="faq-icon">{item.icon}</span>
                      <h3>{item.question}</h3>
                    </div>
                    <span className="toggle-icon">
                      {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
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

        .faq-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          flex-direction: column;
        }

        .faq-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .container {
          max-width: 1000px;
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

        .faq-content {
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

        .faq-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .faq-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .faq-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .faq-card.active {
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .faq-question {
          padding: 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
        }

        .question-content {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .faq-icon {
          color: #667eea;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
        }

        .faq-card h3 {
          font-size: 1.1rem;
          color: #1f2937;
          font-weight: 600;
          margin: 0;
        }

        .toggle-icon {
          color: #9ca3af;
          transition: transform 0.3s ease;
        }

        .faq-card.active .toggle-icon {
          color: #667eea;
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out, padding 0.3s ease;
          background: #f9fafb;
        }

        .faq-card.active .faq-answer {
          max-height: 200px;
          padding: 0 25px 25px 65px;
          border-top: 1px solid #f3f4f6;
        }

        .faq-answer p {
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
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
          .newsletter-form {
            flex-direction: column;
          }
          
          .faq-card.active .faq-answer {
            padding: 0 20px 20px;
          }
        }
      `}</style>
    </>
  );
}
