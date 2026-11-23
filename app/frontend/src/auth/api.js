import axios from 'axios';

const AUTH_URL = '/student/api/auth';

const post = (path, body) =>
  axios.post(`${AUTH_URL}${path}`, body).then((res) => res.data);

// ===== Existing endpoints =====
export const login = (email, password) => post('/login', { email, password });

export const verifyOtp = (email, otp) => post('/verify-otp', { email, otp });

export const register = ({ firstName, lastName, email, password }) =>
  post('/register', { prenom: firstName, nom: lastName, email, password });

// ===== Password recovery =====
export const requestPasswordReset = (email) => post('/forgot-password', { email });

export const resetPassword = (email, code, password) =>
  post('/reset-password', { email, code, password });

// The backend answers in French; the interface is in English.
// Known messages are translated, anything else falls back to a safe generic text.
const KNOWN_MESSAGES = [
  [/mot de passe incorrect/i, 'Incorrect email or password.'],
  [/réinitialisation invalide/i, 'That reset code is invalid or has expired.'],
  [/otp invalide/i, 'That code is invalid or has expired.'],
  [/déjà utilisé/i, 'An account with this email already exists.'],
  [/au moins 8 caractères/i, 'Your password must be at least 8 characters.'],
  [/erreur envoi email/i, "We couldn't send the email right now. Please try again in a moment."],
  [/utilisateur non trouvé/i, 'No account was found for this email.'],
];

export const EMAIL_TAKEN = KNOWN_MESSAGES[3][1];
export const INVALID_RESET_CODE = KNOWN_MESSAGES[1][1];

export function toFriendlyError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  const raw = err.response.data?.message;
  if (err.response.status >= 500 || typeof raw !== 'string') return fallback;

  const known = KNOWN_MESSAGES.find(([pattern]) => pattern.test(raw));
  if (known) return known[1];

  // Never surface long technical messages (stack traces, SQL errors) in the UI.
  return raw.length <= 120 ? raw : fallback;
}
