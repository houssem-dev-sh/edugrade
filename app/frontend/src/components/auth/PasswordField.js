import { useState } from 'react';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextField from '../ui/TextField';

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  const toggle = (
    <button
      type="button"
      className="af-icon-btn"
      onClick={() => setVisible((v) => !v)}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
    >
      {visible ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
    </button>
  );

  return (
    <TextField
      icon={LockOutlined}
      type={visible ? 'text' : 'password'}
      end={toggle}
      spellCheck={false}
      {...props}
    />
  );
}
