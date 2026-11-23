import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import SpaceDashboardOutlined from '@mui/icons-material/SpaceDashboardOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Close from '@mui/icons-material/Close';
import Brand from '../components/ui/Brand';
import Avatar from '../components/ui/Avatar';
import { ToastProvider } from '../components/ui/Toast';
import useScrollLock from '../hooks/useScrollLock';
import { clearSession, getSessionEmail } from '../auth/session';
import { BRAND } from '../config';
import './layout.css';

// Pages listed in the sidebar. Add an entry here when a new page gets a route in App.js.
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: SpaceDashboardOutlined },
];

// Below this width the sidebar becomes a slide-in menu (same breakpoint as layout.css).
const DESKTOP_QUERY = '(min-width: 1024px)';

function MainLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const email = getSessionEmail();

  const logout = () => {
    clearSession();
    navigate('/');
  };

  // The slide-in menu closes when the page changes or the window grows to desktop size.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // While it is open: Escape closes it, focus moves inside, then goes back to the menu button.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const menuButton = menuButtonRef.current;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    sidebarRef.current?.querySelector('[data-autofocus]')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      menuButton?.focus();
    };
  }, [menuOpen]);

  useScrollLock(menuOpen);

  return (
    <ToastProvider>
      <div className="app">
        <a className="app-skip" href="#app-main">
          Skip to content
        </a>

        {/* Top bar: tablets and phones only */}
        <header className="app-topbar" inert={menuOpen}>
          <button
            ref={menuButtonRef}
            type="button"
            className="af-icon-btn is-bordered"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
          >
            <MenuIcon fontSize="inherit" />
          </button>
          <Brand to='/dashboard' label={`${BRAND}, go to dashboard`} />
        </header>

        <div
          className={`app-backdrop${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        <aside
          id="app-sidebar"
          ref={sidebarRef}
          className={`app-sidebar${menuOpen ? ' is-open' : ''}`}
          aria-label="Sidebar"
        >
          <div className="app-sidebar-head">
            <Brand to='/dashboard' label={`${BRAND}, go to dashboard`} onDark />
            <button
              type="button"
              className="af-icon-btn app-sidebar-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              data-autofocus
            >
              <Close fontSize="inherit" />
            </button>
          </div>

          <nav className="app-nav" aria-label="Main">
            <p className="app-nav-label">Workspace</p>
            <ul className="app-nav-list">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end
                    className={({ isActive }) => `app-nav-item${isActive ? ' is-active' : ''}`}
                  >
                    <span className="app-nav-icon" aria-hidden="true">
                      <Icon fontSize="inherit" />
                    </span>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="app-sidebar-foot">
            {email && (
              <div className="app-user" title={email}>
                <Avatar name={email} solid />
                <div className="app-user-text">
                  <span className="app-user-name">{email.split('@')[0]}</span>
                  <span className="app-user-email">{email}</span>
                </div>
              </div>
            )}
            <button type="button" className="app-nav-item" onClick={logout}>
              <span className="app-nav-icon" aria-hidden="true">
                <LogoutOutlined fontSize="inherit" />
              </span>
              Sign out
            </button>
          </div>
        </aside>

        <main id="app-main" className="app-main" tabIndex={-1} inert={menuOpen}>
          <div className="app-content">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default MainLayout;
