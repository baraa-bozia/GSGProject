import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound, Sparkles, ShieldCheck } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (next) => { setMode(next); setError(''); };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (mode === 'register' && password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const payload = mode === 'login'
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password, password_confirmation: passwordConfirmation };
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const validationErrors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
        throw new Error(validationErrors || data.message || (response.status === 401 ? 'Your credentials are incorrect.' : `Request failed (${response.status}).`));
      }
      if (!data.token || !data.user) throw new Error('The API response did not include both a user and a token. Check the backend response format.');
      sessionStorage.setItem('sparr_token', data.token);
      sessionStorage.setItem('sparr_user', JSON.stringify(data.user));
      onAuthenticated(data.user, data.token);
    } catch (err) {
      if (err instanceof TypeError) setError(`Could not connect to the backend at ${API_BASE_URL}. Check that Laravel is running, the API URL is correct, and CORS allows this frontend.`);
      else setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-brand"><span className="auth-brand-mark">s<span>.</span></span><span>sparr</span></div>
        <div className="auth-story-content">
          <div className="auth-eyebrow"><Sparkles size={15}/> YOUR NEXT INTERVIEW STARTS HERE</div>
          <h1>Practice with purpose.<br/><span>Show up with confidence.</span></h1>
          <p>Turn your experience and target role into focused technical interview practice, powered by AI.</p>
          <div className="auth-feature-list">
            <div><span className="auth-feature-icon"><ShieldCheck size={18}/></span><span><strong>Your own private workspace</strong><small>Keep your resumes and practice sessions together.</small></span></div>
            <div><span className="auth-feature-icon"><Sparkles size={18}/></span><span><strong>Practice tailored to your goals</strong><small>Prepare for the skills your target role requires.</small></span></div>
          </div>
        </div>
        <div className="auth-story-footer"><LockKeyhole size={14}/> Your preparation journey, in one place.</div>
      </section>

      <section className="auth-panel-wrap">
        <div className="auth-panel">
          <div className="auth-mobile-brand"><span className="auth-brand-mark">s<span>.</span></span> sparr</div>
          <div className="auth-panel-kicker">WELCOME TO SPARR</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-panel-subtitle">{mode === 'login' ? 'Sign in to continue your interview preparation.' : 'Set up your account and start preparing.'}</p>
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => switchMode('login')}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'selected' : ''} onClick={() => switchMode('register')}>Create account</button>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && <label className="auth-label">Full name<div className="auth-input-wrap"><UserRound size={17}/><input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required/></div></label>}
            <label className="auth-label">Email address<div className="auth-input-wrap"><Mail size={17}/><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
            <label className="auth-label">Password<div className="auth-input-wrap"><LockKeyhole size={17}/><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" minLength={8} required/><button className="password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
            {mode === 'register' && <label className="auth-label">Confirm password<div className="auth-input-wrap"><LockKeyhole size={17}/><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} placeholder="Repeat your password" minLength={8} required/></div></label>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to Sparr' : 'Create account'} {!busy && <ArrowRight size={17}/>}</button>
          </form>
          <p className="auth-terms"><LockKeyhole size={13}/> Your account is authenticated securely by the Sparr backend.</p>
          <p className="auth-api-note">API: {API_BASE_URL}</p>
        </div>
      </section>
    </main>
  );
}
