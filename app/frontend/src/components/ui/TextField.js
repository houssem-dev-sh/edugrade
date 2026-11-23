import { useId } from 'react';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';

export function FieldMessage({ id, error, hint }) {
  if (error) {
    return (
      <p id={id} className="af-error">
        <span className="af-msg-icon" aria-hidden="true">
          <ErrorOutlineOutlined fontSize="inherit" />
        </span>
        {error}
      </p>
    );
  }
  return hint ? <p id={id} className="af-hint">{hint}</p> : null;
}

export default function TextField({
  label,
  icon: Icon,
  error,
  hint,
  end,
  labelAside,
  children,
  id,
  ...inputProps
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const messageId = `${inputId}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div className={`af-field${error ? ' is-invalid' : ''}`}>
      <div className="af-label-row">
        <label htmlFor={inputId} className="af-label">{label}</label>
        {labelAside}
      </div>

      <div className="af-control">
        {Icon && (
          <span className="af-control-icon" aria-hidden="true">
            <Icon fontSize="inherit" />
          </span>
        )}
        <input
          id={inputId}
          className={`af-input${Icon ? ' has-icon' : ''}${end ? ' has-end' : ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          {...inputProps}
        />
        {end && <div className="af-control-end">{end}</div>}
      </div>

      <FieldMessage id={messageId} error={error} hint={hint} />
      {children}
    </div>
  );
}
