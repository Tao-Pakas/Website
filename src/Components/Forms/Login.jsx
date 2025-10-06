import React, { useState } from 'react';
import style from '../../Styles/components/LoginSignup.module.css';

export default function Login() {
  // State to track which form is active
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className={style.CenterScreen}>
      {/* === Login Form === */}
      {activeTab === 'login' && (
        <div className={style.LoginForm}>
          <h1>Login</h1>
          <div className={style.LoginFormInputFields}>
            <div className={style.Feild1}>
              <label htmlFor="loginUsername">Username</label>
              <input type="text" placeholder="Enter your username" id="loginUsername" />
            </div>
            <div className={style.Feild1}>
              <label htmlFor="loginPassword">Password</label>
              <input type="password" placeholder="Enter password" id="loginPassword" />
            </div>
            <h3 onClick={() => setActiveTab('forgot')}>Forgot Password?</h3>
          </div>
          <button className={style.Submit}>Login</button>
          <h3>Or Login with</h3>
          <div className="socialIconsLoginContainer"></div>
          <p>
            Don’t have an account?{" "}
            <b className={style.SignUP} onClick={() => setActiveTab('signup')}>
              Sign Up
            </b>
          </p>
        </div>
      )}

      {/* === Signup Form === */}
      {activeTab === 'signup' && (
        <div className={style.SignUpForm}>
          <h1>Sign Up</h1>
          <div className={style.LoginFormInputFields}>
            <div className={style.Feild1}>
              <label htmlFor="signupUsername">Username</label>
              <input type="text" placeholder="Enter your username" id="signupUsername" />
            </div>
            <div className={style.Feild1}>
              <label htmlFor="signupEmail">Email</label>
              <input type="email" placeholder="Enter your email" id="signupEmail" />
            </div>
            <div className={style.Feild1}>
              <label htmlFor="signupFullName">Full Name</label>
              <input type="text" placeholder="Enter your full name" id="signupFullName" />
            </div>
            <div className={style.Feild1}>
              <label htmlFor="Password">Password</label>
              <input type="password" placeholder="Enter password" id="Password" />
            </div>
          </div>
          <button className={style.Submit}>Sign Up</button>
          <h3>Or Sign Up with</h3>
          <div className="socialIconsLoginContainer"></div>
          <p className={style.SignUPp}> 
            Already have an account?{" "}
            <b className={style.SignUP} onClick={() => setActiveTab('login')}>
              Login
            </b>
          </p>
        </div>
      )}

      {/* === Forgot Password Form === */}
      {activeTab === 'forgot' && (
        <div className={style.ForgotPassword}>
          <h1>Forgot Password</h1>
          <div className={style.LoginFormInputFields}>
            <div className={style.Feild1}>
              <label htmlFor="forgotEmail">Email</label>
              <input type="email" placeholder="Enter your registered email" id="forgotEmail" />
            </div>
          </div>
          <button className={style.Submit}>Reset Password</button>
          
          <p>
            Don’t have an account?{" "}
            <b className={style.SignUP} onClick={() => setActiveTab('signup')}>
              Sign Up
            </b>
          </p>
          <p>
            Remembered your password?{" "}
            <b className={style.SignUP} onClick={() => setActiveTab('login')}>
              Login
            </b>
          </p>
        </div>
      )}
    </div>
  );
}
