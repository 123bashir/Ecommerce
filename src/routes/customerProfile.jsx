import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiPut, FILE_BASE_URL } from '../utils/api';
import {
  FaHome,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaSave,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

export default function CustomerProfile() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Nigeria'
  });

  useEffect(() => {
    // Hide preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      preloader.classList.add('hide');
      preloader.style.display = 'none';
    }

    // Load user data
    setFormData({
      name: currentUser?.name || 'Guest User',
      email: currentUser?.email || 'guest@example.com',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      city: currentUser?.city || '',
      country: currentUser?.country || 'Nigeria'
    });

    if (currentUser?.profile_image) {
      if (currentUser.profile_image.startsWith('http')) {
        setImagePreview(currentUser.profile_image);
      } else {
        setImagePreview(`${FILE_BASE_URL}${currentUser.profile_image}`);
      }
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const showCustomAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImageUrl = currentUser.profile_image;

      // 1. Upload image first if selected
      // 1. Upload image first if selected
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);

        // Send to backend upload route
        const uploadResponse = await fetch(`${FILE_BASE_URL}/api/upload`, {
          method: 'POST',
          // No Content-Type header needed, fetch adds it automatically for FormData
          body: formData
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();

        if (uploadResult.fileUrl) {
          profileImageUrl = uploadResult.fileUrl;
        } else if (uploadResult.telhost && uploadResult.telhost.url) {
          // Fallback for older response structure
          profileImageUrl = uploadResult.telhost.url;
        } else {
          throw new Error('Image upload failed: No URL returned');
        }
      }

      // 2. Update profile with new data and image URL
      const updatePayload = {
        ...formData,
        profile_image: profileImageUrl
      };

      const response = await apiPut(`/customers/${currentUser?.id || 'guest'}`, updatePayload);

      if (response.success) {
        const updatedUser = { ...currentUser, ...formData };

        if (profileImageUrl) {
          updatedUser.profile_image = profileImageUrl;
        }

        updateUser(updatedUser);
        showCustomAlert('Profile updated successfully!', 'success');
      } else {
        showCustomAlert('Failed to update profile.', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showCustomAlert('An error occurred while updating profile: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <div className="container">
            <div className="header-content">
              <div className="breadcrumb-section">
                <Link to="/" className="breadcrumb-link">
                  <FaHome /> Home
                </Link>
                <span className="separator">/</span>
                <span className="current">My Profile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="container">
            <h1 className="page-title">
              <FaUser /> My Profile
            </h1>

            <div className="profile-grid">
              <div className="profile-sidebar">
                <div className="avatar-section">
                  <div className="avatar-wrapper">
                    <img
                      src={imagePreview || 'assets/images/noavata.png'}
                      alt="Profile"
                      className="avatar-image"
                    />
                    <label htmlFor="avatar-upload" className="avatar-upload-btn">
                      <FaCamera />
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <h3 className="user-name">{currentUser?.name || 'User'}</h3>
                  <p className="user-email">{currentUser?.email}</p>
                </div>
              </div>

              <div className="profile-form-section">
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-card">
                    <h2 className="section-title">Personal Information</h2>

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label><FaUser /> Full Name</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label><FaEnvelope /> Email Address</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label><FaPhone /> Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+234 XXX XXX XXXX"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label><FaMapMarkerAlt /> Address</label>
                        <input
                          type="text"
                          name="address"
                          placeholder="Street address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          readOnly
                          className="form-input readonly"
                        />
                      </div>
                    </div>

                    <button type="submit" className="save-btn" disabled={loading}>
                      <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
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



      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .profile-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .profile-header {
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

        .profile-content {
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

        .profile-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 30px;
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .profile-sidebar {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          height: fit-content;
        }

        .avatar-section {
          text-align: center;
        }

        .avatar-wrapper {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 0 auto 20px;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #667eea;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .avatar-upload-btn {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .avatar-upload-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .user-name {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 5px;
        }

        .user-email {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .profile-form-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .section-title {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
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
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
        }

        .form-input {
          padding: 12px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.readonly {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .save-btn {
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
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

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

        @media (max-width: 1024px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 1.8rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .profile-sidebar {
            padding: 20px;
          }

          .profile-form-section {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 10px;
          }

          .avatar-wrapper {
            width: 120px;
            height: 120px;
          }

          .save-btn {
            font-size: 1rem;
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
}





