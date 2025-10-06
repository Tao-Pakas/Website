import React, { useState } from 'react';
import './Button.css';

const Button = ({
  onClick, 
  children, 
  loadingText = 'Loading...',
  isPrimary = false,
  disabled = false,
  type = 'button',
  className = '',
  height = 'auto',
  width = 'auto',
  label = ''
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    
    setLoading(true);
    try {
      await onClick?.();
    } finally {
      setLoading(false);
    }
  };

  // Determine button classes based on props
  const buttonClass = `
    ${isPrimary ? 'button-primary' : 'button'} 
    ${loading ? 'button-loading' : ''} 
    ${disabled ? 'button-disabled' : ''} 
    ${className}
  `.trim();

  // Inline styles for height and width
  const buttonStyle = {
    height: height !== 'auto' ? `${height}px` : 'auto',
    width: width !== 'auto' ? `${width}px` : 'auto',
    minWidth: '80px' // Ensure button has a minimum width
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={loading || disabled}
      className={buttonClass}
      style={buttonStyle}
      aria-label={label || (typeof children === 'string' ? children : 'Button')}
    >
      {loading ? (
        <>
          <span className="button-spinner"></span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;