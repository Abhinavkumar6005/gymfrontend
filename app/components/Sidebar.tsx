'use client';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/Slices/authSlice';
import { ActivePage } from '../dashboard/page';

const navItems: { id: ActivePage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'members',   label: 'Members',   icon: '◎' },
  { id: 'plans',     label: 'Plans',     icon: '◈' },
  { id: 'payments',  label: 'Payments',  icon: '◇' },
  { id: 'trainers',  label: 'Trainers',  icon: '△' },
];

interface Props {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export default function Sidebar({ activePage, setActivePage }: Props) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <aside style={{
     width: '240px',
  height: '100vh',           // ← full viewport height
  background: '#111',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  flexDirection: 'column',
  padding: '0',
  position: 'fixed',         // ← fixed, not sticky
  top: 0,
  left: 0,                   // ← anchor to left edge
  overflow: 'hidden',        // ← no scrolling inside sidebar
  zIndex: 100,    
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 0.85rem 1.5rem; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          letter-spacing: 1px; color: #666;
          border-left: 3px solid transparent;
          transition: all 0.2s;
        }
        .nav-item:hover { color: #fff; background: rgba(255,255,255,0.03); }
        .nav-item.active { color: #C8F542; border-left-color: #C8F542; background: rgba(200,245,66,0.05); }
        .logout-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 0.85rem 1.5rem; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          letter-spacing: 1px; color: #666; border: none; background: none;
          width: 100%; transition: color 0.2s;
        }
        .logout-btn:hover { color: #ff6b6b; }
      `}</style>

      {/* Logo */}
      <div style={{ padding: '1.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '4px', color: '#C8F542' }}>
          IRONFORGE
        </div>
        <div style={{ fontSize: '0.7rem', color: '#444', letterSpacing: '2px', marginTop: '2px' }}>
          ADMIN PANEL
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: '1rem' }}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item${activePage === item.id ? ' active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0' }}>
        <button className="logout-btn" onClick={handleLogout}>
          <span>→</span> Logout
        </button>
      </div>
    </aside>
  );
}