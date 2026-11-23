import { Outlet, useLocation } from 'react-router-dom';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import AuthVisual from './AuthVisual';
import Brand from '../ui/Brand';
import { BRAND } from '../../config';
import './auth.css';

const VISUAL_BY_PATH = {
  '/register': 'register',
  '/forgot-password': 'recovery',
  '/reset-password': 'recovery',
};

// Shared shell for every auth route: it stays mounted while the user moves
// between pages, so only the form animates in.
export default function AuthLayout() {
  const { pathname } = useLocation();

  return (
    <div className="auth">
      <main className="auth-main">
        <header className="auth-header">
          <Brand to="/" label={`${BRAND}, go to sign in`} />
        </header>

        <div className="auth-content">
          <div className="auth-panel" key={pathname}>
            <Outlet />
          </div>
        </div>

        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} {BRAND}</span>
          <span className="auth-footer-secure">
            <span className="af-msg-icon" aria-hidden="true">
              <ShieldOutlined fontSize="inherit" />
            </span>
            Protected by two-step verification
          </span>
        </footer>
      </main>

      <AuthVisual variant={VISUAL_BY_PATH[pathname] || 'login'} />
    </div>
  );
}
