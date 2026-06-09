import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaHome, FaSearch } from 'react-icons/fa';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <div className="content-wrapper">
                <div className="icon-container">
                    <div className="pulse-ring"></div>
                    <FaMapMarkerAlt className="map-icon" />
                </div>

                <h1 className="title">404</h1>
                <h2 className="subtitle">Are You Lost?</h2>
                <p className="description">
                    It seems you've ventured into uncharted territory.
                    The page you are looking for might have been moved, deleted, or possibly never existed.
                </p>

                <div className="action-buttons">
                    <Link to="/shop-list" className="btn btn-primary">
                        <FaSearch className="btn-icon" /> Back to Market
                    </Link>
                    <Link to="/" className="btn btn-secondary">
                        <FaHome className="btn-icon" /> Go Home
                    </Link>
                </div>
            </div>

            <style>{`
        .not-found-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .content-wrapper {
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          padding: 60px 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          backdrop-filter: blur(10px);
          animation: slideUp 0.8s ease-out;
        }

        .icon-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-icon {
          font-size: 80px;
          color: #ff6b6b;
          z-index: 2;
          animation: bounce 2s infinite;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 107, 107, 0.2);
          animation: pulse 2s infinite;
        }

        .title {
          font-size: 80px;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(45deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .subtitle {
          font-size: 32px;
          color: #2c3e50;
          margin: 10px 0 20px;
          font-weight: 700;
        }

        .description {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .action-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .btn-icon {
          margin-right: 8px;
        }

        .btn-primary {
          background: linear-gradient(45deg, #ff6b6b, #ee5253);
          color: white;
          box-shadow: 0 4px 15px rgba(238, 82, 83, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(238, 82, 83, 0.6);
        }

        .btn-secondary {
          background: white;
          color: #2c3e50;
          border: 2px solid #ecf0f1;
        }

        .btn-secondary:hover {
          background: #f8f9fa;
          border-color: #bdc3c7;
          transform: translateY(-2px);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .title { font-size: 60px; }
          .subtitle { font-size: 24px; }
          .content-wrapper { padding: 40px 20px; }
          .action-buttons { flex-direction: column; }
          .btn { width: 100%; justify-content: center; }
        }
      `}</style>
        </div>
    );
}
