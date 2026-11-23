import { useState } from 'react';
import { OTP_LENGTH } from '../../auth/config';

// One real <input> (so paste, SMS/e-mail autofill, backspace and screen readers
// all work natively) drawn as separate digit boxes.
export default function OtpInput({
  id,
  name,
  value,
  onChange,
  onComplete,
  invalid,
  readOnly,
  autoFocus,
  describedBy,
}) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    const next = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(next);
    if (next.length === OTP_LENGTH && next !== value) onComplete?.(next);
  };

  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);
  const half = OTP_LENGTH / 2;

  const cell = (i) => {
    const isActive = focused && i === activeIndex;
    return (
      <div
        key={i}
        className={`af-otp-cell${value[i] ? ' is-filled' : ''}${isActive ? ' is-active' : ''}`}
      >
        {value[i] || (isActive && <span className="af-otp-caret" />)}
      </div>
    );
  };

  return (
    <div className={`af-otp${invalid ? ' is-invalid' : ''}`}>
      <input
        id={id}
        name={name}
        className="af-otp-input"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={OTP_LENGTH}
        readOnly={readOnly}
        autoFocus={autoFocus}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedBy}
        spellCheck={false}
      />
      <div className="af-otp-cells" aria-hidden="true">
        {Array.from({ length: half }, (_, i) => cell(i))}
        <span className="af-otp-sep" />
        {Array.from({ length: OTP_LENGTH - half }, (_, i) => cell(i + half))}
      </div>
    </div>
  );
}
