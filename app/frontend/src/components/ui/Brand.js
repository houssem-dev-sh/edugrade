import { Link } from 'react-router-dom';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import { BRAND } from '../../config';

// Logo + product name. `onDark` is for the navy surface (app sidebar).
export default function Brand({ to, label = BRAND, onDark = false }) {
  return (
    <Link to={to} className={`af-brand${onDark ? ' is-on-dark' : ''}`} aria-label={label}>
      <span className="af-brand-logo" aria-hidden="true">
        <SchoolOutlined fontSize="inherit" />
      </span>
      <span className="af-brand-name">{BRAND}</span>
    </Link>
  );
}
