export const MIN_PASSWORD_LENGTH = 8;

// Linear-time check, no backtracking regex (avoids ReDoS): exactly one "@" with
// text before it, no whitespace, and a dot in the domain with text on both sides.
export function isValidEmail(value) {
  if (typeof value !== 'string' || /\s/.test(value)) return false;
  const at = value.indexOf('@');
  if (at < 1 || at !== value.lastIndexOf('@')) return false;
  const domain = value.slice(at + 1);
  const dot = domain.indexOf('.', 1);
  return dot !== -1 && dot < domain.length - 1;
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!isValidEmail(email)) return 'Enter a valid email address, like name@school.edu.';
  return '';
}

export function validateNewPassword(value) {
  if (!value) return 'Create a password.';
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return '';
}

export function validateConfirm(password, confirm) {
  if (!confirm) return 'Confirm your password.';
  if (password !== confirm) return "Passwords don't match.";
  return '';
}

export const PASSWORD_RULES = [
  { id: 'length', label: `${MIN_PASSWORD_LENGTH}+ characters`, test: (v) => v.length >= MIN_PASSWORD_LENGTH },
  { id: 'case', label: 'Upper & lowercase', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'A number', test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'A symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const LEVELS = [
  { label: 'Too weak', tone: 'weak' },
  { label: 'Weak', tone: 'weak' },
  { label: 'Fair', tone: 'fair' },
  { label: 'Good', tone: 'good' },
  { label: 'Strong', tone: 'strong' },
];

// Score 0–4 = number of rules met; a password under the minimum length never scores above 1.
export function passwordStrength(value) {
  if (!value) return { score: 0, label: '', tone: 'empty' };
  let score = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  if (value.length < MIN_PASSWORD_LENGTH) score = Math.min(score, 1);
  return { score, ...LEVELS[score] };
}
