import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Auth.css';

const Auth = ({ user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Auth error', err);
      // Map common Firebase auth errors to friendlier messages
      const code = err.code || '';
      let msg = err.message || 'Authentication failed';
      if (code.includes('operation-not-allowed')) msg = 'Email/password sign-in is disabled in Firebase Auth settings.';
      else if (code.includes('invalid-email')) msg = 'Please enter a valid email address.';
      else if (code.includes('email-already-in-use')) msg = 'That email is already registered.';
      else if (code.includes('weak-password')) msg = 'Password is too weak (min 6 characters).';
      else if (code.includes('wrong-password')) msg = 'Incorrect password.';
      else if (code.includes('user-not-found')) msg = 'No user found with that email.';
      setError(`${msg} ${code}`.trim());
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="auth-logged-in">
        <div className="auth-email">Signed in as: <strong>{user.email}</strong></div>
        <button className="auth-btn" onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <div className="auth-actions">
          <button type="submit" className="auth-btn">{isSigningUp ? 'Sign up' : 'Sign in'}</button>
          <button type="button" className="auth-toggle" onClick={() => setIsSigningUp(s => !s)}>
            {isSigningUp ? 'Have an account? Sign in' : "Don't have one? Sign up"}
          </button>
        </div>
        {error && <div className="auth-error">{error}</div>}
      </form>
    </div>
  );
};

export default Auth;