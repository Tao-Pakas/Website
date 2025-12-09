import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import style from '../../Styles/components/Nav.module.css';
import { 
  FaShoppingCart, 
  FaChevronDown, 
  FaChevronUp,
  FaTimes,
  FaCog,
  FaUser,
  FaSignInAlt,
  FaExclamationCircle,
  FaHome,
  FaBuilding,
} from 'react-icons/fa';
import { useAuth } from '../../Contexts/AuthContext';

export default function Navbar() {
  const { 
    user, 
    login, 
    logout,
    forgotPassword,
    tempRegister, // Use tempRegister for signup
    hasPendingRegistration,
  } = useAuth();
  
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state management
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    loginPassword: '',
    signupUsername: '',
    signupEmail: '',
    signupFullName: '',
    signupPhone: '',
    signupPassword: '',
    signupRole: 'student',
    firstName: '',      
    lastName: '',      
    university: '',  
    studentIdNumber: '',
    yearOfStudy: '', 
    course: '', 
    companyName: '',
    address: '',
    description: '',
    forgotEmail: ''
  });

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const loginModalRef = useRef(null);
  const signupModalRef = useRef(null);

  // Clear messages when switching tabs or opening modals
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [activeTab, showLoginModal, showSignupModal]);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle login button click
  const handleLoginClick = () => {
    setShowLoginModal(true);
    setActiveTab('login');
    setIsMobileMenuOpen(false);
    setError('');
    setSuccess('');
  };

  // Handle signup button click
  const handleSignupClick = () => {
    setShowSignupModal(true);
    setActiveTab('signup');
    setIsMobileMenuOpen(false);
    setError('');
    setSuccess('');
  };

  // Close login modal and reset form
  const handleCloseLogin = () => {
    setShowLoginModal(false);
    setActiveTab('login');
    setError('');
    setSuccess('');
    setFormData(prev => ({
      ...prev,
      loginIdentifier: '',
      loginPassword: '',
      forgotEmail: ''
    }));
  };

  // Close signup modal and reset form
  const handleCloseSignup = () => {
    setShowSignupModal(false);
    setActiveTab('signup');
    setError('');
    setSuccess('');
    setFormData(prev => ({
      ...prev,
      signupUsername: '',
      signupEmail: '',
      signupFullName: '',
      signupPhone: '',
      signupPassword: '',
      signupRole: 'student',
      firstName: '',
      lastName: '',
      companyName: '',
      address: ''
    }));
  };

  // Handle input changes for all forms
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', { identifier: formData.loginIdentifier });
      
      if (!login || typeof login !== 'function') {
        throw new Error('Login function is not available');
      }

      const result = await login(formData.loginIdentifier, formData.loginPassword);
      
      if (result.success) {
        console.log('✅ Login successful');
        console.log('Logged in user:', result.data?.user);
        setShowLoginModal(false);
        setSuccess('Login successful!');
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          loginIdentifier: '',
          loginPassword: ''
        }));
        
        // Refresh the page to update UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during login \n Please try again');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Enhanced validation
      if (!formData.signupUsername?.trim()) {
        throw new Error('Username is required');
      }
      if (!formData.signupEmail?.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.signupPassword) {
        throw new Error('Password is required');
      }
      if (formData.signupPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate role-specific required fields
      if (formData.signupRole === 'student') {
        if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
          throw new Error('First name and last name are required for students');
        }
      } else {
        if (!formData.signupFullName?.trim()) {
          throw new Error('Full name is required for landlords');
        }
      }

      // Prepare registration data
      const registrationData = {
        username: formData.signupUsername.trim(),
        email: formData.signupEmail.trim().toLowerCase(),
        password: formData.signupPassword,
        phone: formData.signupPhone?.trim() || '',
        role: formData.signupRole,
      };

      // Add role-specific data
      if (formData.signupRole === 'student') {
        registrationData.firstName = formData.firstName.trim();
        registrationData.lastName = formData.lastName.trim();
      } else {
        registrationData.fullName = formData.signupFullName.trim();
        registrationData.companyName = formData.companyName?.trim() || '';
        registrationData.address = formData.address?.trim() || '';
      }

      // Call tempRegister instead of register (stores data locally until email verification)
      const result = await tempRegister(registrationData);

      if (result.success) {
        // Show success message with verification instructions
        setSuccess(`
          ✅ Registration started!
          📧 Verification email sent to ${formData.signupEmail}
          Please check your inbox and click the verification link to complete registration.
        `);
        
        // Reset form
        setFormData({
          loginIdentifier: '',
          loginPassword: '',
          signupUsername: '',
          signupEmail: '',
          signupFullName: '',
          signupPhone: '',
          signupPassword: '',
          signupRole: 'student',
          firstName: '',
          lastName: '',
          companyName: '',
          address: '',
          forgotEmail: ''
        });
        
        // Close modal after 3 seconds and redirect to verification page
        setTimeout(() => {
          setShowSignupModal(false);
          navigate('/verify-email');
        }, 3000);
        
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(formData.forgotEmail);
      
      if (result.success) {
        setSuccess('Password reset instructions sent to your email!');
        setFormData(prev => ({ ...prev, forgotEmail: '' }));
        setTimeout(() => {
          setActiveTab('login');
          setSuccess('');
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setSuccess('Logged out successfully!');
    navigate('/');
  };

  // FIXED: Improved role detection function
  const getUserRole = () => {
    if (!user) return null;
    
    if (user.role && typeof user.role === 'object' && user.role.name) {
      return user.role.name;
    }
    
    if (typeof user.role === 'string') {
      return user.role;
    }
    
    if (user.landlord) return 'landlord';
    if (user.student) return 'student';
    
    return null;
  };

  // Get appropriate dashboard link based on role
  const getDashboardLink = () => {
    const role = getUserRole();
    
    if (role === 'landlord' || user?.landlord) {
      return '/LandlordDash';
    } else if (role === 'student' || user?.student) {
      return '/DashBoard';
    }
    
    return '/DashBoard';
  };

  // Get role display text
  const getRoleDisplay = () => {
    const role = getUserRole();
    
    if (role === 'landlord' || user?.landlord) return '🏠 Landlord';
    if (role === 'student' || user?.student) return '🎓 Student';
    if (role === 'authenticated') return '👤 User';
    if (role === 'public') return '👤 Public';
    
    return '👤 User';
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
      if (signupModalRef.current && !signupModalRef.current.contains(event.target) && showSignupModal) {
        setShowSignupModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginModal, showSignupModal]);

  // Switch to login modal from signup
  const switchToLogin = () => {
    setShowSignupModal(false);
    setTimeout(() => {
      setShowLoginModal(true);
      setActiveTab('login');
    }, 100);
  };

  // Switch to signup modal from login
  const switchToSignup = () => {
    setShowLoginModal(false);
    setTimeout(() => {
      setShowSignupModal(true);
      setActiveTab('signup');
    }, 100);
  };

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
          
          {/* Login/Signup Buttons or User Welcome */}
          {!user ? (
            <div className={style.authButtons}>
              <button 
                className={style.Login}
                onClick={handleLoginClick}
              >
                <FaSignInAlt />
                Log In
              </button>
            </div>
          ) : (
            <div className={style.userWelcome}>
              Welcome, {user.username || user.email}
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
                        <div className={style.userName}>{user.username || user.email}</div>
                        <div className={style.userRole}>
                          <span className={`${style.roleBadge} ${style[getUserRole()]}`}>
                            {getRoleDisplay()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={style.dropdownDivider}></div>
                    
                    {/* Dynamic Dashboard Link based on Role */}
                    <Link 
                      to={getDashboardLink()} 
                      className={`${style.dropdownItem} ${style.dashboardLink}`}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {getUserRole() === 'landlord' ? (
                        <FaBuilding className={style.dropdownIcon} />
                      ) : (
                        <FaHome className={style.dropdownIcon} />
                      )}
                      <span className={style.dropdownText}>
                        {getUserRole() === 'landlord' ? 'Landlord Dashboard' : 'Student Dashboard'}
                      </span>
                    </Link>

                    {/* Shortlist link - only show for students */}
                    {getUserRole() === 'student' && (
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
                      </Link>
                    )}

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
                    
                    <button 
                      className={style.dropdownItem}
                      onClick={handleSignupClick}
                    >
                      <span className={style.dropdownText}>Sign Up</span>
                    </button>
                    
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
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className={style.modalOverlay}>
          <div className={style.loginModal} ref={loginModalRef}>
            <div className={style.modalHeader}>
              <h2>
                {activeTab === 'login' && 'Welcome Back'}
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

            {/* Error/Success Messages */}
            {error && (
              <div className={style.errorMessage}>
                <FaExclamationCircle />
                {error}
              </div>
            )}
            
            {success && (
              <div className={style.successMessage}>
                {success}
              </div>
            )}
            
            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className={style.loginForm}>
                <div className={style.formGroup}>
                  <label htmlFor="loginIdentifier">Email or Username</label>
                  <input
                    type="text"
                    id="loginIdentifier"
                    value={formData.loginIdentifier}
                    onChange={(e) => handleInputChange('loginIdentifier', e.target.value)}
                    placeholder="Enter your email or username"
                    required
                    disabled={loading}
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
                    disabled={loading}
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
                
                <button 
                  type="submit" 
                  className={style.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : (
                    <>
                      <FaSignInAlt />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
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
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className={style.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Reset Password'}
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
                    onClick={switchToSignup}
                  >
                    Sign up
                  </span>
                </p>
              )}
              
              {activeTab === 'forgot' && (
                <>
                  <p>
                    Don't have an account?{" "}
                    <span 
                      className={style.signupLink}
                      onClick={switchToSignup}
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

      {/* Signup Modal */}
      {showSignupModal && (
        <div className={style.modalOverlay}>
          <div className={style.loginModal} ref={signupModalRef}>
            <div className={style.modalHeader}>
              <h2>Create Account</h2>
              <button 
                className={style.closeButton}
                onClick={handleCloseSignup}
                aria-label="Close signup modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className={style.errorMessage}>
                <FaExclamationCircle />
                {error}
              </div>
            )}
            
            {success && (
              <div className={style.successMessage}>
                {success}
              </div>
            )}
            
            {/* Signup Form */}
            <form onSubmit={handleSignupSubmit} className={style.loginForm}>
              <div className={style.formGroup}>
                <label htmlFor="signupUsername">Username *</label>
                <input
                  type="text"
                  id="signupUsername"
                  value={formData.signupUsername}
                  onChange={(e) => handleInputChange('signupUsername', e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className={style.formGroup}>
                <label htmlFor="signupEmail">Email *</label>
                <input
                  type="email"
                  id="signupEmail"
                  value={formData.signupEmail}
                  onChange={(e) => handleInputChange('signupEmail', e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              
              {/* Conditional Name Fields */}
              {formData.signupRole === 'student' ? (
                <>
                  <div className={style.formGroup}>
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Your first name"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className={style.formGroup}>
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Your last name"
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                <div className={style.formGroup}>
                  <label htmlFor="signupFullName">Full Name *</label>
                  <input
                    type="text"
                    id="signupFullName"
                    value={formData.signupFullName}
                    onChange={(e) => handleInputChange('signupFullName', e.target.value)}
                    placeholder="Your full name"
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className={style.formGroup}>
                <label htmlFor="signupPhone">Phone Number *</label>
                <input
                  type="tel"
                  id="signupPhone"
                  value={formData.signupPhone}
                  onChange={(e) => {
                    const numbersOnly = e.target.value.replace(/[^\d]/g, '');
                    handleInputChange('signupPhone', numbersOnly);
                  }}
                  placeholder="0771234567" 
                  required
                  disabled={loading}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                <small style={{color: '#666', fontSize: '12px'}}>
                  Enter numbers only (no + sign or spaces)
                </small>
              </div>
              
              {/* Landlord-specific fields */}
              {formData.signupRole === 'landlord' && (
                <>
                  <div className={style.formGroup}>
                    <label htmlFor="companyName">Company Name</label>
                    <input
                      type="text"
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Your company or property business name"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className={style.formGroup}>
                    <label htmlFor="address">Business Address</label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Your business address"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
              
              <div className={style.formGroup}>
                <label htmlFor="signupRole">I am a *</label>
                <select
                  id="signupRole"
                  value={formData.signupRole}
                  onChange={(e) => handleInputChange('signupRole', e.target.value)}
                  required
                  disabled={loading}
                  className={style.roleSelect}
                >
                  <option value="student">🎓 Student (Looking for accommodation)</option>
                  <option value="landlord">🏠 Landlord (Listing properties)</option>
                </select>
              </div>
              
              <div className={style.formGroup}>
                <label htmlFor="signupPassword">Password *</label>
                <input
                  type="password"
                  id="signupPassword"
                  value={formData.signupPassword}
                  onChange={(e) => handleInputChange('signupPassword', e.target.value)}
                  placeholder="Enter password (min. 6 characters)"
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className={style.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={style.loadingSpinner}></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
            
            {/* Form Footer Links */}
            <div className={style.modalFooter}>
              <p>
                Already have an account?{" "}
                <span 
                  className={style.signupLink}
                  onClick={switchToLogin}
                >
                  Login
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}