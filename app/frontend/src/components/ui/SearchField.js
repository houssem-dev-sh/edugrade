import { useId, useRef } from 'react';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import Close from '@mui/icons-material/Close';

// Compact search box with a clear button. `label` is read by screen readers only.
export default function SearchField({ value, onChange, label, placeholder, className }) {
  const id = useId();
  const inputRef = useRef(null);

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={className} role="search">
      <label htmlFor={id} className="af-visually-hidden">{label}</label>
      <div className="af-control">
        <span className="af-control-icon" aria-hidden="true">
          <SearchOutlined fontSize="inherit" />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="search"
          className={`af-input is-compact has-icon${value ? ' has-end' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {value && (
          <div className="af-control-end">
            <button type="button" className="af-icon-btn" onClick={clear} aria-label="Clear search">
              <Close fontSize="inherit" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
