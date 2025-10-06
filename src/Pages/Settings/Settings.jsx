import React, { useState, useEffect } from 'react';
import style from '../../Styles/pages/SettingsPage.module.css';
import { 
  FaUser, 
  FaBell, 
  FaLock, 
  FaPalette, 
  FaShieldAlt, 
  FaQuestionCircle,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaCheckCircle
} from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';

export default function SettingsPage() {
  const { user, setUser, updateUserSettings } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    // Profile
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    university: '',
    course: '',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    priceAlerts: true,
    newListings: true,
    bookingUpdates: true,
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    
    // Preferences
    theme: 'light',
    language: 'en',
    currency: 'USD',
    distanceUnit: 'kilometers',
    emailFrequency: 'immediate'
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form data from user context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        university: user.university || '',
        course: user.course || '',
        ...user.settings
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Profile validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Security validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    try {
      setSaveStatus('saving');
      
      // Prepare settings data
      const settingsData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          university: formData.university,
          course: formData.course
        },
        notifications: {
          emailNotifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
          smsNotifications: formData.smsNotifications,
          priceAlerts: formData.priceAlerts,
          newListings: formData.newListings,
          bookingUpdates: formData.bookingUpdates
        },
        security: {
          twoFactorAuth: formData.twoFactorAuth
        },
        preferences: {
          theme: formData.theme,
          language: formData.language,
          currency: formData.currency,
          distanceUnit: formData.distanceUnit,
          emailFrequency: formData.emailFrequency
        }
      };

      // Update password if provided
      if (formData.newPassword) {
        settingsData.security.password = formData.newPassword;
      }

      // Update user in context
      if (setUser) {
        setUser(prev => ({
          ...prev,
          ...settingsData.profile,
          settings: {
            ...prev.settings,
            ...settingsData
          }
        }));
      }

      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settingsData));
      
      // Apply theme immediately
      if (formData.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (formData.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        university: '',
        course: '',
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: true,
        priceAlerts: true,
        newListings: true,
        bookingUpdates: true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorAuth: false,
        theme: 'light',
        language: 'en',
        currency: 'USD',
        distanceUnit: 'kilometers',
        emailFrequency: 'immediate'
      };
      
      setFormData(defaultSettings);
      localStorage.removeItem('userSettings');
      
      // Reset theme
      document.documentElement.removeAttribute('data-theme');
      
      setSaveStatus('reset');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      },
      preferences: {
        theme: formData.theme,
        language: formData.language,
        currency: formData.currency
      },
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `varsitycribs-settings-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data, including favorites, shortlists, and listings. Are you absolutely sure?')) {
        // Simulate account deletion
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'preferences', label: 'Preferences', icon: <FaPalette /> },
    { id: 'privacy', label: 'Privacy', icon: <FaShieldAlt /> },
    { id: 'help', label: 'Help & Support', icon: <FaQuestionCircle /> }
  ];

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return { message: 'Saving your settings...', type: 'info' };
      case 'success':
        return { message: 'Settings saved successfully!', type: 'success' };
      case 'error':
        return { message: 'Error saving settings. Please check the form.', type: 'error' };
      case 'reset':
        return { message: 'Settings reset to defaults.', type: 'info' };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className={style.SettingsPage}>
      <div className={style.settingsContainer}>
        {/* Sidebar Navigation */}
        <div className={style.sidebar}>
          <h2>Settings</h2>
          <nav className={style.sidebarNav}>
            {settingsSections.map(section => (
              <button
                key={section.id}
                className={`${style.navItem} ${activeSection === section.id ? style.activeNav : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className={style.mainContent}>
          <div className={style.contentHeader}>
            <h1>
              {settingsSections.find(s => s.id === activeSection)?.icon}
              {settingsSections.find(s => s.id === activeSection)?.label}
            </h1>
            <p>Manage your account settings and preferences</p>
            
            {statusMessage && (
              <div className={`${style.statusMessage} ${style[statusMessage.type]}`}>
                <FaCheckCircle />
                {statusMessage.message}
              </div>
            )}
          </div>

          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className={style.settingsSection}>
              <div className={style.formGrid}>
                <div className={style.formGroup}>
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? style.errorInput : ''}
                  />
                  {errors.firstName && <span className={style.errorText}>{errors.firstName}</span>}
                </div>
                <div className={style.formGroup}>
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? style.errorInput : ''}
                  />
                  {errors.lastName && <span className={style.errorText}>{errors.lastName}</span>}
                </div>
                <div className={style.formGroup}>
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? style.errorInput : ''}
                  />
                  {errors.email && <span className={style.errorText}>{errors.email}</span>}
                </div>
                <div className={style.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className={style.formGroup}>
                  <label>University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    placeholder="Your university name"
                  />
                </div>
                <div className={style.formGroup}>
                  <label>Course/Program</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    placeholder="Your course of study"
                  />
                </div>
                <div className={style.formGroupFull}>
                  <label>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows="4"
                    placeholder="Tell us about yourself and what you're looking for..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className={style.settingsSection}>
              <div className={style.toggleGroup}>
                <h3>Notification Channels</h3>
                <div className={style.toggleItem}>
                  <div>
                    <label>Email Notifications</label>
                    <p>Receive updates via email</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    />
                    <span className={style.slider}></span>
                  </label>
                </div>
                <div className={style.toggleItem}>
                  <div>
                    <label>Push Notifications</label>
                    <p>Receive browser notifications</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.pushNotifications}
                      onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                    />
                    <span className={style.slider}></span>
                  </label>
                </div>
                <div className={style.toggleItem}>
                  <div>
                    <label>SMS Notifications</label>
                    <p>Receive text message alerts</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.smsNotifications}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                    />
                    <span className={style.slider}></span>
                  </label>
                </div>
              </div>

              <div className={style.toggleGroup}>
                <h3>Notification Types</h3>
                <div className={style.toggleItem}>
                  <div>
                    <label>Price Alerts</label>
                    <p>Get notified when prices change</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.priceAlerts}
                      onChange={(e) => handleInputChange('priceAlerts', e.target.checked)}
                    />
                    <span className={style.slider}></span>
                  </label>
                </div>
                <div className={style.toggleItem}>
                  <div>
                    <label>New Listings</label>
                    <p>Get notified about new properties</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.newListings}
                      onChange={(e) => handleInputChange('newListings', e.target.checked)}
                    />
                    <span className={style.slider}></span>
                  </label>
                </div>
                <div className={style.toggleItem}>
                  <div>
                    <label>Booking Updates</label>
                    <p>Get updates on your bookings and viewings</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.bookingUpdates}
                      onChange={(e) => handleInputChange('bookingUpdates', e.target.checked)}
                    />
                    <span className={style.slider}></span>
                  </label>
                </div>
              </div>

              <div className={style.formGroup}>
                <label>Email Frequency</label>
                <select
                  value={formData.emailFrequency}
                  onChange={(e) => handleInputChange('emailFrequency', e.target.value)}
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className={style.settingsSection}>
              <div className={style.formGrid}>
                <div className={style.formGroup}>
                  <label>Current Password</label>
                  <div className={style.passwordInput}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className={style.passwordToggle}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className={style.formGroup}>
                  <label>New Password</label>
                  <div className={style.passwordInput}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                      className={errors.newPassword ? style.errorInput : ''}
                    />
                    <button
                      type="button"
                      className={style.passwordToggle}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && <span className={style.errorText}>{errors.newPassword}</span>}
                </div>
                <div className={style.formGroup}>
                  <label>Confirm New Password</label>
                  <div className={style.passwordInput}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                      className={errors.confirmPassword ? style.errorInput : ''}
                    />
                    <button
                      type="button"
                      className={style.passwordToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className={style.errorText}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className={style.toggleItem}>
                <div>
                  <label>Two-Factor Authentication</label>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <label className={style.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={formData.twoFactorAuth}
                    onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                  />
                  <span className={style.slider}></span>
                </label>
              </div>

              <div className={style.securityActions}>
                <button className={style.exportButton} onClick={handleExportData}>
                  Export My Data
                </button>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeSection === 'preferences' && (
            <div className={style.settingsSection}>
              <div className={style.formGrid}>
                <div className={style.formGroup}>
                  <label>Theme</label>
                  <select
                    value={formData.theme}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                <div className={style.formGroup}>
                  <label>Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className={style.formGroup}>
                  <label>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
                <div className={style.formGroup}>
                  <label>Distance Unit</label>
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) => handleInputChange('distanceUnit', e.target.value)}
                  >
                    <option value="kilometers">Kilometers</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className={style.settingsSection}>
              <div className={style.privacySection}>
                <h3>Data & Privacy</h3>
                <div className={style.privacyItem}>
                  <div>
                    <label>Data Collection</label>
                    <p>Allow anonymous usage data collection to help improve our services</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span className={style.slider}></span>
                  </label>
                </div>
                <div className={style.privacyItem}>
                  <div>
                    <label>Personalized Recommendations</label>
                    <p>Show personalized property recommendations based on your activity</p>
                  </div>
                  <label className={style.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span className={style.slider}></span>
                  </label>
                </div>
                
                <div className={style.privacyActions}>
                  <button className={style.exportButton} onClick={handleExportData}>
                    Export My Data
                  </button>
                  <button className={style.deleteButton} onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Help & Support */}
          {activeSection === 'help' && (
            <div className={style.settingsSection}>
              <div className={style.helpSection}>
                <h3>Help & Support</h3>
                <div className={style.helpLinks}>
                  <a href="/help/faq" className={style.helpLink}>
                    Frequently Asked Questions
                  </a>
                  <a href="/help/contact" className={style.helpLink}>
                    Contact Support
                  </a>
                  <a href="/help/guides" className={style.helpLink}>
                    User Guides
                  </a>
                  <a href="/help/feedback" className={style.helpLink}>
                    Send Feedback
                  </a>
                </div>
                
                <div className={style.appInfo}>
                  <h4>App Information</h4>
                  <p>Version: 1.0.0</p>
                  <p>Last Updated: January 2024</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={style.actionButtons}>
            <button 
              className={style.saveButton} 
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className={style.spinner}></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
            <button className={style.resetButton} onClick={handleResetSettings}>
              <FaTimes />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}