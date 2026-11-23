import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MailOutlined from '@mui/icons-material/MailOutlined';
import LockResetOutlined from '@mui/icons-material/LockResetOutlined';
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import TextField from '../components/ui/TextField';
import Alert from '../components/ui/Alert';
import SubmitButton from '../components/auth/SubmitButton';
import * as authApi from '../auth/api';
import { validateEmail } from '../auth/validation';
import { useCooldown } from '../auth/hooks';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useForm from '../hooks/useForm';
import { CODE_TTL_MINUTES, OTP_LENGTH, RESEND_COOLDOWN } from '../auth/config';

function BackToSignIn() {
  return (
    <Link to="/" className="af-back">
      <span className="af-back-icon" aria-hidden="true">
        <ArrowBack fontSize="inherit" />
      </span>
      Back to sign in
    </Link>
  );
}

export default function ForgotPassword() {
  const location = useLocation();
  const { values, bind, validateAll } = useForm(
    { email: location.state?.email || '' },
    { email: validateEmail },
  );
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, startCooldown] = useCooldown();

  const email = values.email.trim();

  useDocumentTitle(sent ? 'Check your email' : 'Reset your password');

  const sendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await authApi.requestPasswordReset(email);
      if (data.success) {
        setSent(true);
        startCooldown(RESEND_COOLDOWN);
        return true;
      }
    } catch (err) {
      setError(authApi.toFriendlyError(err, "We couldn't send the reset code. Please try again."));
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll(e.currentTarget)) return;
    await sendCode();
  };

  const resend = async () => {
    if (cooldown > 0 || loading) return;
    setInfo('');
    if (await sendCode()) setInfo(`A new code is on its way to ${email}.`);
  };

  if (sent) {
    return (
      <section className="af-page" key="sent">
        <div className="af-badge-icon is-success">
          <MarkEmailReadOutlined fontSize="inherit" />
        </div>

        <header className="af-head">
          <h1 className="af-title">Check your email</h1>
          <p className="af-subtitle">
            If an account exists for <strong>{email}</strong>, you'll receive a {OTP_LENGTH}-digit
            reset code shortly. It expires in {CODE_TTL_MINUTES} minutes.
          </p>
        </header>

        <div className="af-form">
          {error && <Alert tone="error">{error}</Alert>}
          {info && !error && <Alert tone="info">{info}</Alert>}

          <Link to="/reset-password" state={{ email }} className="af-btn af-btn-primary af-btn-lg af-btn-block">
            <span>Enter reset code</span>
            <span className="af-btn-icon is-trailing" aria-hidden="true">
              <ArrowForward fontSize="inherit" />
            </span>
          </Link>
        </div>

        <div className="af-foot">
          <p>
            Didn't receive it?{' '}
            <button
              type="button"
              className="af-link af-link-btn"
              onClick={resend}
              disabled={cooldown > 0 || loading}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
            {' · '}
            <button
              type="button"
              className="af-link af-link-btn"
              onClick={() => {
                setSent(false);
                setError('');
                setInfo('');
              }}
            >
              Use another email
            </button>
          </p>
          <BackToSignIn />
        </div>
      </section>
    );
  }

  return (
    <section className="af-page" key="request">
      <div className="af-badge-icon">
        <LockResetOutlined fontSize="inherit" />
      </div>

      <header className="af-head">
        <h1 className="af-title">Forgot your password?</h1>
        <p className="af-subtitle">
          No worries. Enter the email linked to your account and we'll send you a {OTP_LENGTH}-digit
          reset code.
        </p>
      </header>

      <form className="af-form" noValidate onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}

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

        <SubmitButton loading={loading} loadingText="Sending code…">
          Send reset code
        </SubmitButton>
      </form>

      <div className="af-foot">
        <BackToSignIn />
      </div>
    </section>
  );
}
