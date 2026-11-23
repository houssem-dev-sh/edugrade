import TrendingUp from '@mui/icons-material/TrendingUp';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import KeyOutlined from '@mui/icons-material/KeyOutlined';
import Check from '@mui/icons-material/Check';
import { CODE_TTL_MINUTES } from '../../auth/config';

const VARIANTS = {
  login: {
    eyebrow: 'Grades portal',
    title: 'Every grade, every student, in one place.',
    text: 'Follow results, courses and enrollments across your school, securely and from any device.',
    float: { icon: VerifiedUserOutlined, title: 'Identity verified', meta: 'Two-step sign-in' },
  },
  register: {
    eyebrow: 'Get started',
    title: 'Your school year, clearly organised.',
    text: 'Create your account in under a minute and keep track of your courses, grades and enrollments.',
    float: { icon: AutoAwesomeOutlined, title: 'Account ready', meta: 'Welcome aboard' },
  },
  recovery: {
    eyebrow: 'Account recovery',
    title: 'Back into your account in a minute.',
    text: `Reset codes expire after ${CODE_TTL_MINUTES} minutes and work only once, so your account stays yours.`,
    float: { icon: KeyOutlined, title: 'Reset code sent', meta: `Expires in ${CODE_TTL_MINUTES} minutes` },
  },
};

const BARS = [38, 56, 46, 68, 58, 80, 70, 94];

const STUDENTS = [
  { initials: 'AB', name: 'Amira Ben Salah', course: 'Algorithms', grade: '17.5' },
  { initials: 'YK', name: 'Youssef Karray', course: 'Databases', grade: '16.0' },
  { initials: 'LM', name: 'Lina Mansour', course: 'Networks', grade: '15.5' },
];

const FEATURES = ['Two-step sign-in', 'Role-based access', 'Grades & enrollments'];

export default function AuthVisual({ variant }) {
  const copy = VARIANTS[variant];
  const FloatIcon = copy.float.icon;

  return (
    <aside className="auth-visual">
      <span className="av-orb av-orb-1" />
      <span className="av-orb av-orb-2" />
      <span className="av-orb av-orb-3" />

      <div className="av-copy" key={variant}>
        <span className="av-eyebrow">
          <span className="av-dot" aria-hidden="true" />
          {copy.eyebrow}
        </span>
        <h2 className="av-title">{copy.title}</h2>
        <p className="av-text">{copy.text}</p>
      </div>

      {/* Decorative product preview */}
      <div className="av-stage" aria-hidden="true">
        <div className="av-mock">
          <div className="av-card">
            <div className="av-card-head">
              <div>
                <p className="av-card-title">Semester overview</p>
                <p className="av-card-sub">Computer Science · Year 2</p>
              </div>
              <span className="av-chip">S1</span>
            </div>

            <div className="av-stat-row">
              <div>
                <p className="av-stat">
                  15.8<small>/20</small>
                </p>
                <p className="av-stat-label">Class average</p>
              </div>
              <span className="av-trend">
                <TrendingUp fontSize="inherit" /> +1.2
              </span>
            </div>

            <div className="av-chart">
              {BARS.map((height, i) => (
                <span
                  key={i}
                  className={i === BARS.length - 1 ? 'is-current' : ''}
                  style={{ '--h': `${height}%`, '--d': `${i * 70}ms` }}
                />
              ))}
            </div>

            <ul className="av-list">
              {STUDENTS.map((s) => (
                <li key={s.name}>
                  <span className="av-avatar">{s.initials}</span>
                  <span className="av-who">
                    <strong>{s.name}</strong>
                    <span>{s.course}</span>
                  </span>
                  <span className="av-grade">{s.grade}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="av-float" key={variant}>
            <span className="av-float-icon">
              <FloatIcon fontSize="inherit" />
            </span>
            <span className="av-float-text">
              <strong>{copy.float.title}</strong>
              <span>{copy.float.meta}</span>
            </span>
          </div>

          <div className="av-pill">
            <span className="av-pill-dot" />
            Algorithms · 17.5/20
          </div>
        </div>
      </div>

      <ul className="av-features">
        {FEATURES.map((feature) => (
          <li key={feature}>
            <span className="av-check" aria-hidden="true">
              <Check fontSize="inherit" />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </aside>
  );
}
