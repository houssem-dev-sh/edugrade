import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MailOutlined from '@mui/icons-material/MailOutlined';
import KeyOutlined from '@mui/icons-material/KeyOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import TextField, { FieldMessage } from '../components/ui/TextField';
import PasswordField from '../components/auth/PasswordField';
import PasswordStrength from '../components/auth/PasswordStrength';
import OtpInput from '../components/auth/OtpInput';
import Alert from '../components/ui/Alert';
import SubmitButton from '../components/auth/SubmitButton';
import * as authApi from '../auth/api';
import { validateConfirm, validateEmail, validateNewPassword } from '../auth/validation';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useForm from '../hooks/useForm';
import { OTP_LENGTH } from '../auth/config';

const validators = {
  email: validateEmail,
  code: (v) => (v.length === OTP_LENGTH ? '' : `Enter the ${OTP_LENGTH}-digit code from your email.`),
  password: validateNewPassword,
  confirm: (v, all) => validateConfirm(all.password, v),
};

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  // Email comes from the "Forgot password" step; if the page is opened directly, ask for it.
  const knownEmail = location.state?.email || '';

  const { values, setValue, errors, setErrors, bind, validateAll } = useForm(
    { email: knownEmail, code: '', password: '', confirm: '' },
    validators,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useDocumentTitle('Set a new password');

  const email = values.email.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    if (!validateAll(form)) return;

    setLoading(true);
    try {
      const data = await authApi.resetPassword(email, values.code, values.password);
      if (data.success) {
        navigate('/', {
          state: { email, notice: 'Password updated. Sign in with your new password.' },
        });
        return;
      }
    } catch (err) {
      const message = authApi.toFriendlyError(err, "We couldn't reset your password. Please try again.");
      if (message === authApi.INVALID_RESET_CODE) {
        setValue('code', '');
        setErrors((prev) => ({ ...prev, code: message }));
        form.elements.namedItem('code')?.focus();
      } else {
        setError(message);
      }
    }
    setLoading(false);
  };

  return (
    <section className="af-page">
      <div className="af-badge-icon">
        <KeyOutlined fontSize="inherit" />
      </div>

      <header className="af-head">
        <h1 className="af-title">Set a new password</h1>
        <p className="af-subtitle">
          {knownEmail ? (
            <>
              Enter the code we sent to <strong>{knownEmail}</strong> and choose a new password.
            </>
          ) : (
            'Enter your email, the code we sent you, and choose a new password.'
          )}
        </p>
      </header>

      <form className="af-form" noValidate onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}

        {knownEmail ? (
          // Lets password managers attach the new password to the right account.
          <input type="hidden" name="username" autoComplete="username" value={knownEmail} />
        ) : (
          <TextField
            label="Email"
            icon={MailOutlined}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@school.edu"
            autoFocus
            {...bind('email')}
          />
        )}

        <div className={`af-field${errors.code ? ' is-invalid' : ''}`}>
          <label htmlFor="reset-code" className="af-label">
            Reset code
          </label>
          <OtpInput
            id="reset-code"
            name="code"
            value={values.code}
            onChange={(code) => setValue('code', code)}
            invalid={Boolean(errors.code)}
            readOnly={loading}
            autoFocus={Boolean(knownEmail)}
            describedBy={errors.code ? 'reset-code-message' : undefined}
          />
          <FieldMessage id="reset-code-message" error={errors.code} />
        </div>

        <PasswordField
          label="New password"
          autoComplete="new-password"
          placeholder="Create a new password"
          {...bind('password')}
        >
          <PasswordStrength password={values.password} />
        </PasswordField>

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          {...bind('confirm')}
        />

        <SubmitButton loading={loading} loadingText="Updating password…">
          Reset password
        </SubmitButton>
      </form>

      <div className="af-foot">
        <p>
          Didn't get a code?{' '}
          <Link to="/forgot-password" state={{ email }} className="af-link">
            Request a new one
          </Link>
        </p>
        <Link to="/" className="af-back">
          <span className="af-back-icon" aria-hidden="true">
            <ArrowBack fontSize="inherit" />
          </span>
          Back to sign in
        </Link>
      </div>
    </section>
  );
}
