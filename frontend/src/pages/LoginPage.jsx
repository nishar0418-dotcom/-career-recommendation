import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  User, 
  GraduationCap, 
  Building2 
} from 'lucide-react';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, googleLogin } = useAuth();

  // Mode: 'login' or 'register'
  const isRegisterInitial = location.pathname === '/register';
  const [mode, setMode] = useState(isRegisterInitial ? 'register' : 'login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Engineering',
    year_of_study: '3rd Year',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'AI & Data Science',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'MCA / BCA',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', 'Final Year', 'Postgraduate'];

  // If already authenticated, redirect to dashboard or intended route
  const from = location.state?.from?.pathname || '/dashboard';
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' || from === '/register' || from === '/' ? '/dashboard' : from);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!regData.name || !regData.email || !regData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        department: regData.department,
        year_of_study: regData.year_of_study,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await googleLogin({
        email: 'alex.google@gmail.com',
        name: 'Alex Johnson (Google)',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setMode('login');
    setEmail('student@careermatch.ai');
    setPassword('Student@123');
    setError('');
  };

  const fillDemoAdmin = () => {
    setMode('login');
    setEmail('admin@careermatch.ai');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            marginBottom: '10px'
          }}>
            <Compass size={25} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
            CareerMatch<span style={{ color: 'var(--primary-600)' }}>.AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            AI-Powered Career & Internship Recommendation System
          </p>
        </div>

        {/* Unified Card Container */}
        <div className="card" style={{ padding: '28px', boxShadow: 'var(--shadow-md)' }}>
          {/* Segmented Tab Switcher: [ Sign In ] [ Create Account ] */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                padding: '9px 16px',
                fontSize: '0.88rem',
                fontWeight: mode === 'login' ? '700' : '600',
                color: mode === 'login' ? 'var(--primary-700)' : 'var(--text-secondary)',
                backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                padding: '9px 16px',
                fontSize: '0.88rem',
                fontWeight: mode === 'register' ? '700' : '600',
                color: mode === 'register' ? 'var(--primary-700)' : 'var(--text-secondary)',
                backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={15} /> Create Account
            </button>
          </div>

          {/* Error Message Box */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'var(--danger-50)',
              border: '1px solid var(--danger-100)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-600)',
              fontSize: '0.86rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <div>
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s ease',
                  marginBottom: '16px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>or sign in with email</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" htmlFor="login-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    <input
                      id="login-email"
                      type="email"
                      className="form-input"
                      placeholder="student@careermatch.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    <input
                      id="login-password"
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={loading || googleLoading}
                >
                  {loading ? 'Signing In...' : (
                    <>
                      <LogIn size={16} /> Sign In to Portal
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Accounts */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  1-Click Instant Demo Login
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={fillDemoStudent}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                  >
                    <Sparkles size={13} color="var(--primary-600)" /> Student Demo
                  </button>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                  >
                    <ShieldCheck size={13} color="var(--purple-600)" /> Admin Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: SIGN UP / REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="Arun Kumar"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    placeholder="arun@university.edu"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={regData.department}
                    onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                    style={{ fontSize: '0.84rem' }}
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Year of Study</label>
                  <select
                    className="form-select"
                    value={regData.year_of_study}
                    onChange={(e) => setRegData({ ...regData, year_of_study: e.target.value })}
                    style={{ fontSize: '0.84rem' }}
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" htmlFor="reg-pass">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
                    <input
                      id="reg-pass"
                      type="password"
                      className="form-input"
                      placeholder="Min. 6 chars"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      style={{ paddingLeft: '34px', fontSize: '0.84rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
                    <input
                      id="reg-confirm"
                      type="password"
                      className="form-input"
                      placeholder="Re-type password"
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      style={{ paddingLeft: '34px', fontSize: '0.84rem' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <UserPlus size={16} /> Register & Continue
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
