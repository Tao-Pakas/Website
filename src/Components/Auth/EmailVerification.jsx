// Components/Auth/EmailVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import style from '../../Styles/components/EmailVerification.module.css';
import { FaCheckCircle, FaExclamationCircle, FaEnvelope, FaClock } from 'react-icons/fa';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    completeRegistration, 
    hasPendingRegistration,
    getPendingEmail,
    resendVerificationEmail,
    user 
  } = useAuth();
  
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const confirmationToken = searchParams.get('confirmation');

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      navigate('/dashboard');
      return;
    }

    // Check for pending registration
    if (hasPendingRegistration()) {
      setPendingEmail(getPendingEmail());
      setStatus('pending');
    } else {
      setStatus('no_pending');
    }

    // Handle email confirmation if token exists
    if (confirmationToken) {
      handleEmailConfirmation(confirmationToken);
    }
  }, [confirmationToken, user]);

  useEffect(() => {
    let timer;
    if (status === 'cooldown' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setStatus('pending');
    }
    return () => clearTimeout(timer);
  }, [countdown, status]);

  const handleEmailConfirmation = async (token) => {
    setLoading(true);
    setStatus('verifying');
    
    try {
      const result = await completeRegistration(token);
      
      if (result.success) {
        setStatus('verified');
        setMessage(result.message);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) return;
    
    setLoading(true);
    const result = await resendVerificationEmail(pendingEmail);
    
    if (result.success) {
      setStatus('cooldown');
      setCountdown(60);
      setMessage('Verification email resent! Please check your inbox.');
    } else {
      setStatus('error');
      setMessage(result.error);
    }
    
    setLoading(false);
  };

  const handleStartOver = () => {
    localStorage.removeItem('temp_registration');
    navigate('/signup');
  };

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className={style.statusContainer}>
            <div className={style.loadingSpinner}></div>
            <p>Checking your verification status...</p>
          </div>
        );

      case 'pending':
        return (
          <div className={style.statusContainer}>
            <FaEnvelope className={`${style.icon} ${style.iconPending}`} />
            <h2>Verify Your Email</h2>
            <p className={style.emailDisplay}>{pendingEmail}</p>
            <p>We've sent a verification link to your email address.</p>
            <p className={style.note}>Please check your inbox and click the link to complete your registration.</p>
            
            <div className={style.actions}>
              <button 
                onClick={handleResendVerification}
                className={style.resendButton}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <button 
                onClick={handleStartOver}
                className={style.secondaryButton}
              >
                Start Over
              </button>
            </div>
            
            <div className={style.infoBox}>
              <FaClock />
              <span>Didn't receive the email? Check your spam folder or resend.</span>
            </div>
          </div>
        );

      case 'cooldown':
        return (
          <div className={style.statusContainer}>
            <FaEnvelope className={`${style.icon} ${style.iconSuccess}`} />
            <h2>Email Sent!</h2>
            <p>We've resent the verification email to:</p>
            <p className={style.emailDisplay}>{pendingEmail}</p>
            <p>Please check your inbox.</p>
            
            <div className={style.cooldownInfo}>
              <p>You can resend again in: <span className={style.countdown}>{countdown}s</span></p>
            </div>
            
            <button 
              onClick={handleStartOver}
              className={style.secondaryButton}
            >
              Start Over
            </button>
          </div>
        );

      case 'verifying':
        return (
          <div className={style.statusContainer}>
            <div className={style.loadingSpinner}></div>
            <h2>Verifying Your Email...</h2>
            <p>Please wait while we complete your registration.</p>
          </div>
        );

      case 'verified':
        return (
          <div className={style.statusContainer}>
            <FaCheckCircle className={`${style.icon} ${style.iconSuccess}`} />
            <h2>Email Verified Successfully! 🎉</h2>
            <p>{message}</p>
            <p>Redirecting you to your dashboard...</p>
            <div className={style.loadingSpinner}></div>
          </div>
        );

      case 'error':
        return (
          <div className={style.statusContainer}>
            <FaExclamationCircle className={`${style.icon} ${style.iconError}`} />
            <h2>Verification Failed</h2>
            <p className={style.errorText}>{message}</p>
            
            <div className={style.actions}>
              {pendingEmail ? (
                <button 
                  onClick={handleResendVerification}
                  className={style.resendButton}
                >
                  Try Again
                </button>
              ) : null}
              <button 
                onClick={handleStartOver}
                className={style.primaryButton}
              >
                Register Again
              </button>
              <button 
                onClick={() => navigate('/login')}
                className={style.secondaryButton}
              >
                Go to Login
              </button>
            </div>
          </div>
        );

      case 'no_pending':
        return (
          <div className={style.statusContainer}>
            <FaExclamationCircle className={`${style.icon} ${style.iconError}`} />
            <h2>No Pending Registration</h2>
            <p>We couldn't find any pending registration for your account.</p>
            <p>This could be because:</p>
            <ul className={style.reasons}>
              <li>Your registration session has expired (valid for 1 hour)</li>
              <li>You've already verified your email</li>
              <li>You need to register first</li>
            </ul>
            
            <div className={style.actions}>
              <button 
                onClick={() => navigate('/signup')}
                className={style.primaryButton}
              >
                Register Now
              </button>
              <button 
                onClick={() => navigate('/login')}
                className={style.secondaryButton}
              >
                Go to Login
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={style.container}>
      <div className={style.card}>
        {renderContent()}
      </div>
    </div>
  );
}