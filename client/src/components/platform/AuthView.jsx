import React, { useState } from 'react';
import {
  ShieldCheck,
  LockKeyhole,
  LogIn,
  UserPlus,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AuthView({ onSuccess }) {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  // Form State
  const [auth, setAuth] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Forgot Password / Recovery State
  const [forgotEmail, setForgotEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [serverRecoveryCode, setServerRecoveryCode] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setNotice('');
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!auth.email || !auth.password) {
      setError('Please provide both email and password.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const user = await login(auth.email, auth.password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.message || 'Invalid credentials. Please verify your email and password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  // 2. Handle Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!auth.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (auth.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (auth.password !== auth.confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setBusy(true);

    try {
      const user = await register(auth.name, auth.email, auth.password);
      showToast(`Student account registered. Welcome, ${user.name}!`, 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.message || 'Registration failed. Email may already be in use.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  // 3. Handle Requesting Recovery Code
  const handleSendRecoveryCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your account email address.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const res = await forgotPassword(forgotEmail);
      setCodeSent(true);
      if (res.recoveryCode) {
        setServerRecoveryCode(res.recoveryCode);
        setRecoveryCode(res.recoveryCode);
      }
      setNotice(res.message || 'A 6-digit recovery code has been generated for your account.');
      showToast('Recovery verification code generated.', 'success');
    } catch (err) {
      const msg = err.message || 'Failed to dispatch recovery code.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  // 4. Handle Submitting Code & Resetting Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!recoveryCode) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      const res = await resetPassword(forgotEmail, recoveryCode, newPassword);
      showToast(res.message || 'Password updated successfully! Please sign in.', 'success');
      switchMode('login');
      setAuth((prev) => ({ ...prev, email: forgotEmail, password: '' }));
      setCodeSent(false);
      setRecoveryCode('');
      setServerRecoveryCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const msg = err.message || 'Failed to update password. Code may have expired.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-grid-overlay" />

      {/* Main Glassmorphic Auth Card */}
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-card-brand">
          <div className="auth-brand-logo">
            <ShieldCheck size={24} />
          </div>
          <div className="auth-brand-info">
            <span className="auth-brand-name">NEXGUARD</span>
            <span className="auth-brand-badge">ENTERPRISE</span>
          </div>
        </div>

        {/* Card Title & Description */}
        <div className="auth-card-header">
          <h1 className="auth-card-title">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="auth-card-subtitle">
            {mode === 'login' && 'Sign in to access your offensive security workspace.'}
            {mode === 'register' && 'Enroll to practice real-world hands-on offensive scenarios.'}
            {mode === 'forgot' &&
              (!codeSent
                ? 'Enter your registered email address to receive a recovery code.'
                : 'Enter your 6-digit recovery code and assign a new password.')}
          </p>
        </div>

        {/* Segmented Mode Switcher (Sign In vs Sign Up) */}
        {mode !== 'forgot' && (
          <div className="auth-tabs-segmented" role="tablist">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
              role="tab"
              aria-selected={mode === 'login'}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
              role="tab"
              aria-selected={mode === 'register'}
            >
              <UserPlus size={15} />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Dynamic Alerts */}
        {error && (
          <div className="auth-alert error" role="alert">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="auth-alert success" role="status">
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{notice}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. SIGN IN FORM                                              */}
        {/* ============================================================ */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
            {/* Quick Demo Access banner for instant overview of all portals */}
            <div style={{
              padding: '12px 14px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(14, 165, 233, 0.03) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} style={{ color: '#38bdf8' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#f0f6fc', letterSpacing: '0.01em' }}>Demo Portal Accounts</span>
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                  Password: <code style={{ color: '#7dd3fc' }}>nextguard.io</code>
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuth({ ...auth, email: 'demo@nexguard.io', password: 'nextguard.io' });
                    showToast('Admin demo credentials set. Click "Sign in" for Command Center & full control.', 'info');
                  }}
                  style={{
                    background: auth.email === 'demo@nexguard.io' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.08)',
                    color: auth.email === 'demo@nexguard.io' ? '#38bdf8' : '#cbd5e1',
                    border: `1px solid ${auth.email === 'demo@nexguard.io' ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}`,
                    borderRadius: '7px',
                    padding: '6px 4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="demo@nexguard.io (Command Center)"
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuth({ ...auth, email: 'instructor@nexguard.io', password: 'nextguard.io' });
                    showToast('Instructor demo credentials set. Click "Sign in" for Instructor Studio.', 'info');
                  }}
                  style={{
                    background: auth.email === 'instructor@nexguard.io' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.08)',
                    color: auth.email === 'instructor@nexguard.io' ? '#38bdf8' : '#cbd5e1',
                    border: `1px solid ${auth.email === 'instructor@nexguard.io' ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}`,
                    borderRadius: '7px',
                    padding: '6px 4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="instructor@nexguard.io (Instructor Studio)"
                >
                  🎓 Instructor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuth({ ...auth, email: 'student@nexguard.io', password: 'nextguard.io' });
                    showToast('Student demo credentials set. Click "Sign in" for LMS & Cloud Labs.', 'info');
                  }}
                  style={{
                    background: auth.email === 'student@nexguard.io' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.08)',
                    color: auth.email === 'student@nexguard.io' ? '#38bdf8' : '#cbd5e1',
                    border: `1px solid ${auth.email === 'student@nexguard.io' ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}`,
                    borderRadius: '7px',
                    padding: '6px 4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="student@nexguard.io (Student Workspace & Labs)"
                >
                  💻 Student
                </button>
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="signin-email">
                Email address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="signin-email"
                  type="email"
                  className="auth-input"
                  value={auth.email}
                  onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="signin-password">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-link-forgot"
                  onClick={() => switchMode('forgot')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrapper">
                <LockKeyhole size={16} className="auth-input-icon" />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  value={auth.password}
                  onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={busy}>
              {busy ? (
                'Authenticating…'
              ) : (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="auth-btn-sso"
              onClick={() =>
                showToast(
                  'Enterprise Single Sign-On (SAML 2.0 / Okta) is managed by your organization administrator.',
                  'info'
                )
              }
            >
              <LockKeyhole size={14} />
              <span>Continue with Enterprise SSO</span>
            </button>

            <div className="auth-card-footer">
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => switchMode('register')}
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* 2. REGISTRATION FORM                                         */}
        {/* ============================================================ */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
            <div className="auth-clearance-pill">
              <GraduationCap size={15} style={{ flexShrink: 0 }} />
              <span>Account Type: Student / Security Learner</span>
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-name">
                Full name
              </label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="register-name"
                  type="text"
                  className="auth-input"
                  value={auth.name}
                  onChange={(e) => setAuth({ ...auth, name: e.target.value })}
                  placeholder="Alex Mercer"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-email">
                Email address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="register-email"
                  type="email"
                  className="auth-input"
                  value={auth.email}
                  onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                  placeholder="student@university.edu"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-password">
                Password (min 8 characters)
              </label>
              <div className="auth-input-wrapper">
                <LockKeyhole size={16} className="auth-input-icon" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  value={auth.password}
                  onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-confirm">
                Confirm password
              </label>
              <div className="auth-input-wrapper">
                <LockKeyhole size={16} className="auth-input-icon" />
                <input
                  id="register-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  value={auth.confirmPassword}
                  onChange={(e) => setAuth({ ...auth, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={busy}>
              {busy ? (
                'Creating account…'
              ) : (
                <>
                  Create student account <ArrowRight size={15} />
                </>
              )}
            </button>

            <div className="auth-card-footer">
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => switchMode('login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* 3. FORGOT PASSWORD & RECOVERY FORM                           */}
        {/* ============================================================ */}
        {mode === 'forgot' && (
          <div className="auth-form">
            {serverRecoveryCode && (
              <div className="auth-code-chip">
                <div>
                  <span style={{ color: '#8fa597', fontSize: '10px', display: 'block' }}>
                    SIMULATED VERIFICATION CODE:
                  </span>
                  <strong>{serverRecoveryCode}</strong>
                </div>
                <button
                  type="button"
                  className="auth-code-btn-autofill"
                  onClick={() => setRecoveryCode(serverRecoveryCode)}
                >
                  Auto-fill Code
                </button>
              </div>
            )}

            {!codeSent ? (
              <form onSubmit={handleSendRecoveryCode} className="auth-form" noValidate>
                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="forgot-email">
                    Account email address
                  </label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="forgot-email"
                      type="email"
                      className="auth-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={busy}>
                  {busy ? (
                    'Generating code…'
                  ) : (
                    <>
                      Send recovery code <KeyRound size={15} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="auth-form" noValidate>
                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="recovery-code">
                    6-digit verification code
                  </label>
                  <div className="auth-input-wrapper">
                    <KeyRound size={16} className="auth-input-icon" />
                    <input
                      id="recovery-code"
                      type="text"
                      className="auth-input"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="e.g. 482910"
                      maxLength={10}
                      style={{ letterSpacing: '0.12em', fontWeight: 650 }}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="reset-new-password">
                    New password (min 8 characters)
                  </label>
                  <div className="auth-input-wrapper">
                    <LockKeyhole size={16} className="auth-input-icon" />
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <button
                      type="button"
                      className="auth-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="reset-confirm-password">
                    Confirm new password
                  </label>
                  <div className="auth-input-wrapper">
                    <LockKeyhole size={16} className="auth-input-icon" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="auth-input"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={busy}>
                  {busy ? (
                    'Updating password…'
                  ) : (
                    <>
                      Update password & sign in <CheckCircle2 size={15} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="auth-link-forgot"
                  onClick={() => setCodeSent(false)}
                  style={{ textAlign: 'center', marginTop: '6px' }}
                >
                  Resend verification code or change email
                </button>
              </form>
            )}

            <div className="auth-card-footer">
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => switchMode('login')}
                >
                  Return to sign in
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Compliance Strip Below Card */}
      <div className="auth-trust-strip">
        <div className="auth-trust-item">
          <ShieldCheck size={14} style={{ color: '#baff66' }} />
          <span>256-Bit TLS Encryption</span>
        </div>
        <div className="auth-trust-dot">•</div>
        <div className="auth-trust-item">
          <LockKeyhole size={14} style={{ color: '#baff66' }} />
          <span>Role-Based Access Control</span>
        </div>
        <div className="auth-trust-dot">•</div>
        <div className="auth-trust-item">
          <GraduationCap size={14} style={{ color: '#baff66' }} />
          <span>Isolated Sandboxes</span>
        </div>
      </div>
    </div>
  );
}
