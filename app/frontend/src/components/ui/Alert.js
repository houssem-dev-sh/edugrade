import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

const ICONS = {
  error: ErrorOutlineOutlined,
  success: CheckCircleOutlineOutlined,
  info: InfoOutlined,
};

// `action` is an optional element shown on the right (for example a "Try again" button).
export default function Alert({ tone = 'error', action, children }) {
  const Icon = ICONS[tone];
  return (
    <div className={`af-alert tone-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="af-alert-icon" aria-hidden="true">
        <Icon fontSize="inherit" />
      </span>
      <div className="af-alert-body">{children}</div>
      {action}
    </div>
  );
}
