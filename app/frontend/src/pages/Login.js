import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MailOutlined from '@mui/icons-material/MailOutlined';
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import TextField, { FieldMessage } from '../components/ui/TextField';
import PasswordField from '../components/auth/PasswordField';
import OtpInput from '../components/auth/OtpInput';
import Alert from '../components/ui/Alert';
import SubmitButton from '../components/auth/SubmitButton';
import * as authApi from '../auth/api';
import { saveSession } from '../auth/session';
import { validateEmail } from '../auth/validation';
import { useCooldown } from '../auth/hooks';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useForm from '../hooks/useForm';
import { CODE_TTL_MINUTES, OTP_LENGTH, RESEND_COOLDOWN } from '../auth/config';

const validators = {
  email: validateEmail,
  password: (v) => (v ? '' : 'Enter your password.'),
};

const Login = () => {
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';
  const notice = location.state?.notice || '';

  // Step 1 = credentials, step 2 = one-time code sent by email
  const [step, setStep] = useState(1);
  const { values, bind, validateAll } = useForm(
    { email: prefilledEmail, password: '' },
    validators,
  );
  const [remember, setRemember] = useState(true);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, startCooldown] = useCooldown();

  const email = values.email.trim();

  useDocumentTitle(step === 1 ? 'Sign in' : 'Verify your sign-in');

  // ===== Step 1: email + password → the backend emails a 6-digit code =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateAll(e.currentTarget)) return;

    setLoading(true);
    try {
      const data = await authApi.login(email, values.password);
      if (data.success) {
        setOtp('');
        setInfo('');
        setStep(2);
        startCooldown(RESEND_COOLDOWN);
      }
    } catch (err) {
      setError(authApi.toFriendlyError(err, 'Unable to sign in right now. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ===== Step 2: verify the code → JWT =====
  const verify = async (code) => {
    if (loading) return;
    if (code.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(email, code);
      if (data.success) {
        saveSession(data.token, email, remember);
        window.location.href = '/dashboard';
        return; // keep the loading state while the browser navigates
      }
    } catch (err) {
      setError(authApi.toFriendlyError(err, 'That code is invalid or has expired.'));
      setOtp('');
    }
    setLoading(false);
  };

  const resendCode = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setInfo('');
    try {
      await authApi.login(email, values.password);
      setOtp('');
      setInfo(`We sent a new code to ${email}.`);
      startCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(authApi.toFriendlyError(err));
    }
  };

  const backToCredentials = () => {
    setStep(1);
    setOtp('');
    setError('');
    setInfo('');
  };

  if (step === 2) {
    return (
      <section className="af-page" key="verify">
        <div className="af-badge-icon">
          <MarkEmailReadOutlined fontSize="inherit" />
        </div>

        <header className="af-head">
          <h1 className="af-title">Check your email</h1>
          <p className="af-subtitle">
            We sent a {OTP_LENGTH}-digit code to <strong>{email}</strong>. Enter it below to
            finish signing in.
          </p>
        </header>

        <form
          className="af-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            verify(otp);
          }}
        >
          {error && <Alert tone="error">{error}</Alert>}
          {info && <Alert tone="info">{info}</Alert>}

          <div className="af-field">
            <label htmlFor="login-otp" className="af-label">
              Verification code
            </label>
            <OtpInput
              id="login-otp"
              name="otp"
              value={otp}
              onChange={(code) => {
                setOtp(code);
                if (error) setError('');
              }}
              onComplete={verify}
              invalid={Boolean(error)}
              readOnly={loading}
              autoFocus
              describedBy="login-otp-hint"
            />
            <FieldMessage id="login-otp-hint" hint={`The code expires in ${CODE_TTL_MINUTES} minutes.`} />
          </div>

          <SubmitButton
            loading={loading}
            loadingText="Verifying…"
            disabled={otp.length !== OTP_LENGTH}
          >
            Verify and continue
          </SubmitButton>
        </form>

        <div className="af-foot">
          <p>
            Didn't get the code?{' '}
            <button
              type="button"
              className="af-link af-link-btn"
              onClick={resendCode}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </p>
          <button type="button" className="af-back" onClick={backToCredentials}>
            <span className="af-back-icon" aria-hidden="true">
              <ArrowBack fontSize="inherit" />
            </span>
            Use a different account
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="af-page" key="credentials">
      <header className="af-head">
        <h1 className="af-title">Welcome back</h1>
        <p className="af-subtitle">Sign in to continue where you left off.</p>
      </header>

      <form className="af-form" noValidate onSubmit={handleLogin}>
        {error && <Alert tone="error">{error}</Alert>}
        {!error && notice && <Alert tone="success">{notice}</Alert>}

        <TextField
          label="Email"
          icon={MailOutlined}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@school.edu"
          autoFocus={!prefilledEmail}
          {...bind('email')}
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          autoFocus={Boolean(prefilledEmail)}
          {...bind('password')}
        />

        <div className="af-row-between">
          <label className="af-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" state={{ email }} className="af-link af-small">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading} loadingText="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="af-alt">
        Don't have an account?{' '}
        <Link to="/register" className="af-link">
          Sign up
        </Link>
      </p>
    </section>
  );
};

export default Login;
