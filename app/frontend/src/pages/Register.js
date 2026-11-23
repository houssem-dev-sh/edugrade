import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import MailOutlined from '@mui/icons-material/MailOutlined';
import TextField from '../components/ui/TextField';
import PasswordField from '../components/auth/PasswordField';
import PasswordStrength from '../components/auth/PasswordStrength';
import Alert from '../components/ui/Alert';
import SubmitButton from '../components/auth/SubmitButton';
import * as authApi from '../auth/api';
import { validateConfirm, validateEmail, validateNewPassword } from '../auth/validation';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useForm from '../hooks/useForm';
import { BRAND } from '../config';

const validators = {
  firstName: (v) => (v.trim() ? '' : 'Enter your first name.'),
  lastName: (v) => (v.trim() ? '' : 'Enter your last name.'),
  email: validateEmail,
  password: validateNewPassword,
  confirm: (v, all) => validateConfirm(all.password, v),
};

export default function Register() {
  const navigate = useNavigate();
  const { values, bind, validateAll, setErrors } = useForm(
    { firstName: '', lastName: '', email: '', password: '', confirm: '' },
    validators,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useDocumentTitle('Create your account');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    if (!validateAll(form)) return;

    const email = values.email.trim();
    setLoading(true);
    try {
      const data = await authApi.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email,
        password: values.password,
      });
      if (data.success) {
        navigate('/', {
          state: { email, notice: 'Your account is ready. Sign in to continue.' },
        });
        return;
      }
    } catch (err) {
      const message = authApi.toFriendlyError(err, "We couldn't create your account. Please try again.");
      if (message === authApi.EMAIL_TAKEN) {
        setErrors((prev) => ({ ...prev, email: message }));
        form.elements.namedItem('email')?.focus();
      } else {
        setError(message);
      }
    }
    setLoading(false);
  };

  return (
    <section className="af-page">
      <header className="af-head">
        <h1 className="af-title">Create your account</h1>
        <p className="af-subtitle">
          Join {BRAND} to follow your courses, grades and enrollments.
        </p>
      </header>

      <form className="af-form" noValidate onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}

        <div className="af-row-2">
          <TextField
            label="First name"
            icon={PersonOutlined}
            autoComplete="given-name"
            placeholder="Amira"
            autoFocus
            {...bind('firstName')}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            placeholder="Ben Salah"
            {...bind('lastName')}
          />
        </div>

        <TextField
          label="Email address"
          icon={MailOutlined}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@school.edu"
          {...bind('email')}
        />

        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          {...bind('password')}
        >
          <PasswordStrength password={values.password} />
        </PasswordField>

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          {...bind('confirm')}
        />

        <SubmitButton loading={loading} loadingText="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <p className="af-alt">
        Already have an account?{' '}
        <Link to="/" className="af-link">
          Sign in
        </Link>
      </p>
    </section>
  );
}
