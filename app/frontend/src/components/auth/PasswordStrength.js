import Check from '@mui/icons-material/Check';
import { PASSWORD_RULES, passwordStrength } from '../../auth/validation';

export default function PasswordStrength({ password }) {
  const { score, label, tone } = passwordStrength(password);
  const litBars = password ? Math.max(score, 1) : 0;

  return (
    <div className="af-strength">
      <div className="af-strength-head">
        <div className={`af-strength-bars tone-${tone}`} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i < litBars ? 'is-on' : ''} />
          ))}
        </div>
        <span className={`af-strength-label tone-${tone}`} aria-live="polite">
          {label && <span className="af-visually-hidden">Password strength: </span>}
          {label}
        </span>
      </div>
      <ul className="af-rules">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.id} className={met ? 'is-met' : ''}>
              <span className="af-rule-dot" aria-hidden="true">
                {met && <Check fontSize="inherit" />}
              </span>
              {rule.label}
              <span className="af-visually-hidden">{met ? ' (done)' : ''}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
