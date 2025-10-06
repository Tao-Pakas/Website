import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import style from '../../Styles/components/Nav.module.css';
import { 
  FaHeart, 
  FaBookmark, 
  FaShoppingCart, 
  FaChevronDown, 
  FaChevronUp,
  FaBars,
  FaTimes,
  FaCog,
  FaDashcube,
  FaTachometerAlt,
  FaUser,
  FaSignInAlt
} from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';

export default function Navbar() {
  const { favorites, bookmarks, shortlist, user, setUser } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'signup', 'forgot'
  
  // Form state management
  const [formData, setFormData] = useState({
    loginUsername: '',
    loginPassword: '',
    signupUsername: '',
    signupEmail: '',
    signupFullName: '',
    signupPassword: '',
    forgotEmail: ''
  });

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const loginModalRef = useRef(null);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle login button click - show modal with login form
  const handleLoginClick = () => {
    setShowLoginModal(true);
    setActiveTab('login'); // Reset to login tab
    setIsMobileMenuOpen(false);
  };

  // Close login modal and reset form
  const handleCloseLogin = () => {
    setShowLoginModal(false);
    setActiveTab('login');
    setFormData({
      loginUsername: '',
      loginPassword: '',
      signupUsername: '',
      signupEmail: '',
      signupFullName: '',
      signupPassword: '',
      forgotEmail: ''
    });
  };

  // Handle input changes for all forms
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submissions
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', {
      username: formData.loginUsername,
      password: formData.loginPassword
    });
    
    // Mock successful login - replace with actual API call
    setUser({
      id: 1,
      name: formData.loginUsername,
      email: `${formData.loginUsername}@example.com`,
      isLoggedIn: true
    });
    
    setShowLoginModal(false);
    alert('Login successful!');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    console.log('Signup attempt:', {
      username: formData.signupUsername,
      email: formData.signupEmail,
      fullName: formData.signupFullName,
      password: formData.signupPassword
    });
    
    // Mock successful signup - replace with actual API call
    setUser({
      id: 2,
      name: formData.signupFullName,
      email: formData.signupEmail,
      isLoggedIn: true
    });
    
    setShowLoginModal(false);
    alert('Account created successfully!');
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    console.log('Password reset requested for:', formData.forgotEmail);
    
    // Mock password reset - replace with actual API call
    alert(`Password reset instructions sent to ${formData.forgotEmail}`);
    setActiveTab('login');
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (loginModalRef.current && !loginModalRef.current.contains(event.target) && showLoginModal) {
        setShowLoginModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginModal]);

  return (
    <>
      <nav className={style.Nav}>
        <div className={style.logo}>
          <Link to="/">VarsityCribs</Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className={`${style.mobileMenuButton} ${isMobileMenuOpen ? style.active : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div 
          className={`${style.Links} ${isMobileMenuOpen ? style.mobileMenuOpen : ''}`} 
          ref={mobileMenuRef}
        >
          <Link 
            to='/' 
            className={style.Navicons}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to='/Listings' 
            className={style.Navicons}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Property Listings
          </Link>
          <Link 
            to='/About' 
            className={style.Navicons}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>
          <Link 
            to='/Contact' 
            className={style.Navicons}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
          
          {/* Login Button or User Welcome */}
          {!user ? (
            <button 
              className={style.Login}
              onClick={handleLoginClick}
            >
              <FaSignInAlt />
              Log In
            </button>
          ) : (
            <div className={style.userWelcome}>
              Welcome, {user.name}
            </div>
          )}

          {/* Dropdown Container */}
          <div className={style.dropdownContainer} ref={dropdownRef}>
            <button 
              onClick={toggleDropdown} 
              className={style.dropDownButton}
              aria-expanded={isDropdownOpen}
              aria-label="Toggle user menu"
            >
              {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isDropdownOpen && (
              <div className={style.dropdownMenu}>
                {user ? (
                  // User is logged in
                  <>
                    <div className={style.userInfo}>
                      <FaUser className={style.userIcon} />
                      <div>
                        <div className={style.userName}>{user.name}</div>
                        <div className={style.userEmail}>{user.email}</div>
                      </div>
                    </div>
                    <div className={style.dropdownDivider}></div>
                    <Link 
                      to="/Favourites" 
                      className={style.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FaHeart className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Favorites</span>
                      <span className={style.count}>{favorites?.favoriteCount || 0}</span>
                    </Link>
                    
                    <Link 
                      to="/SavedPage" 
                      className={style.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FaShoppingCart className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Shortlist</span>
                      <span className={style.count}>{shortlist?.shortlistCount || 0}</span>
                    </Link>

                    <Link 
                      to="/Settings" 
                      className={style.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FaCog className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Settings</span>
                    </Link>

                    <Link 
                      to="/DashBoard" 
                      className={style.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FaTachometerAlt className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Dashboard</span>
                    </Link>
                    
                    <div className={style.dropdownDivider}></div>
                    
                    <button 
                      className={`${style.dropdownItem} ${style.logoutButton}`}
                      onClick={handleLogout}
                    >
                      <FaSignInAlt className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Log Out</span>
                    </button>
                  </>
                ) : (
                  // User is not logged in
                  <>
                    <button 
                      className={style.dropdownItem}
                      onClick={handleLoginClick}
                    >
                      <FaSignInAlt className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Log In</span>
                    </button>
                    
                    <Link 
                      to="/Favourites" 
                      className={style.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FaHeart className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Favorites</span>
                      <span className={style.count}>{favorites?.favoriteCount || 0}</span>
                    </Link>
                    
                    <Link 
                      to="/SavedPage" 
                      className={style.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FaShoppingCart className={style.dropdownIcon} />
                      <span className={style.dropdownText}>Shortlist</span>
                      <span className={style.count}>{shortlist?.shortlistCount || 0}</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Login/Signup Modal */}
      {showLoginModal && (
        <div className={style.modalOverlay}>
          <div className={style.loginModal} ref={loginModalRef}>
            <div className={style.modalHeader}>
              <h2>
                {activeTab === 'login' && 'Welcome Back'}
                {activeTab === 'signup' && 'Create Account'}
                {activeTab === 'forgot' && 'Reset Password'}
              </h2>
              <button 
                className={style.closeButton}
                onClick={handleCloseLogin}
                aria-label="Close login modal"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* === Login Form === */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className={style.loginForm}>
                <div className={style.formGroup}>
                  <label htmlFor="loginUsername">Username</label>
                  <input
                    type="text"
                    id="loginUsername"
                    value={formData.loginUsername}
                    onChange={(e) => handleInputChange('loginUsername', e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div className={style.formGroup}>
                  <label htmlFor="loginPassword">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={formData.loginPassword}
                    onChange={(e) => handleInputChange('loginPassword', e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <div className={style.formOptions}>
                  <span 
                    className={style.forgotPassword}
                    onClick={() => setActiveTab('forgot')}
                  >
                    Forgot password?
                  </span>
                </div>
                
                <button type="submit" className={style.submitButton}>
                  <FaSignInAlt />
                  Sign In
                </button>
              </form>
            )}

            {/* === Signup Form === */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className={style.loginForm}>
                <div className={style.formGroup}>
                  <label htmlFor="signupUsername">Username</label>
                  <input
                    type="text"
                    id="signupUsername"
                    value={formData.signupUsername}
                    onChange={(e) => handleInputChange('signupUsername', e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div className={style.formGroup}>
                  <label htmlFor="signupEmail">Email</label>
                  <input
                    type="email"
                    id="signupEmail"
                    value={formData.signupEmail}
                    onChange={(e) => handleInputChange('signupEmail', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className={style.formGroup}>
                  <label htmlFor="signupFullName">Full Name</label>
                  <input
                    type="text"
                    id="signupFullName"
                    value={formData.signupFullName}
                    onChange={(e) => handleInputChange('signupFullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className={style.formGroup}>
                  <label htmlFor="signupPassword">Password</label>
                  <input
                    type="password"
                    id="signupPassword"
                    value={formData.signupPassword}
                    onChange={(e) => handleInputChange('signupPassword', e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                <button type="submit" className={style.submitButton}>
                  Create Account
                </button>
              </form>
            )}

            {/* === Forgot Password Form === */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleForgotPasswordSubmit} className={style.loginForm}>
                <div className={style.formGroup}>
                  <label htmlFor="forgotEmail">Email</label>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={formData.forgotEmail}
                    onChange={(e) => handleInputChange('forgotEmail', e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                
                <button type="submit" className={style.submitButton}>
                  Reset Password
                </button>
              </form>
            )}
            
            {/* Form Footer Links */}
            <div className={style.modalFooter}>
              {activeTab === 'login' && (
                <p>
                  Don't have an account?{" "}
                  <span 
                    className={style.signupLink}
                    onClick={() => setActiveTab('signup')}
                  >
                    Sign up
                  </span>
                </p>
              )}
              
              {activeTab === 'signup' && (
                <p>
                  Already have an account?{" "}
                  <span 
                    className={style.signupLink}
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </span>
                </p>
              )}
              
              {activeTab === 'forgot' && (
                <>
                  <p>
                    Don't have an account?{" "}
                    <span 
                      className={style.signupLink}
                      onClick={() => setActiveTab('signup')}
                    >
                      Sign up
                    </span>
                  </p>
                  <p>
                    Remembered your password?{" "}
                    <span 
                      className={style.signupLink}
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}