'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '@/store/store';
import { adminLogin } from '@/store/Slices/authSlice';

export default function AdminLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(adminLogin({ email, password }));
    if (adminLogin.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", background: '#0a0a0a', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 4rem;
          background: linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, transparent 100%);
        }
        .nav-logo { font-size: 2rem; letter-spacing: 4px; color: #C8F542; cursor: pointer; }

        .login-wrapper {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 2rem; position: relative; overflow: hidden;
        }
        .bg-text {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          font-size: clamp(100px, 18vw, 260px); color: rgba(255,255,255,0.03);
          letter-spacing: -8px; white-space: nowrap; pointer-events: none; user-select: none;
        }

        .login-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 460px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #111;
          padding: 3rem;
        }

        .login-tag {
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
          letter-spacing: 4px; text-transform: uppercase; color: #C8F542;
          margin-bottom: 0.75rem;
        }
        .login-title { font-size: 4rem; line-height: 0.9; margin-bottom: 2.5rem; }
        .login-title span { color: #C8F542; }

        .form-group { margin-bottom: 1.25rem; }
        .form-label {
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
          letter-spacing: 2px; text-transform: uppercase; color: #666;
          display: block; margin-bottom: 0.5rem;
        }
        .form-input {
          width: 100%; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1);
          color: #fff; padding: 0.85rem 1rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
          outline: none; transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #C8F542; }
        .form-input::placeholder { color: #444; }

        .password-wrapper { position: relative; }
        .password-toggle {
          position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #666; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .password-toggle:hover { color: #C8F542; }

        .error-msg {
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          color: #ff6b6b; background: rgba(255,107,107,0.08);
          border: 1px solid rgba(255,107,107,0.2);
          padding: 0.75rem 1rem; margin-bottom: 1.25rem;
        }

        .btn-login {
          width: 100%; background: #C8F542; color: #000; border: none;
          padding: 1rem; font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 0.9rem; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer; transition: opacity 0.2s;
          margin-top: 0.5rem;
        }
        .btn-login:hover:not(:disabled) { opacity: 0.85; }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 2rem 0; }

        .login-footer-text {
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
          color: #444; text-align: center; letter-spacing: 1px;
        }

        .accent-bar { width: 40px; height: 3px; background: #C8F542; margin-bottom: 1.5rem; }
      `}</style>

      {/* NAV */}
      <nav className="login-nav">
        <div className="nav-logo" onClick={() => router.push('/')}>IRONFORGE</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Admin Portal
        </div>
      </nav>

      {/* LOGIN WRAPPER */}
      <div className="login-wrapper">
        <div className="bg-text">ADMIN</div>

        <div className="login-card">
          <div className="accent-bar" />
          <div className="login-tag">Admin Portal</div>
          <h1 className="login-title">
            SIGN<br />INTO<br /><span>FORGE</span>
          </h1>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@ironforge.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '5rem' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <div className="login-divider" />
          <p className="login-footer-text">
            © 2025 Ironforge Gym · Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
}