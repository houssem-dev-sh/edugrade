import { useEffect, useId, useRef } from 'react';
import Close from '@mui/icons-material/Close';
import useScrollLock from '../../hooks/useScrollLock';

// Modal dialog built on the native <dialog>: the browser traps focus inside it,
// closes it with Escape and puts focus back on the element that opened it.
//
// Keep the component mounted and drive it with `open`. The content only exists
// while the dialog is open, so any form inside starts fresh every time.
// Mark the element that should receive focus first with `data-autofocus`.
export default function Dialog({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  tone,
  size = 'md',
  busy = false,
  children,
}) {
  const ref = useRef(null);
  const pressStartedOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const isOpen = dialog.hasAttribute('open');

    if (open && !isOpen) {
      // Very old browsers have no showModal(): the dialog still opens, just not as a modal.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      dialog.querySelector('[data-autofocus]')?.focus();
    } else if (!open && isOpen) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  const requestClose = () => {
    if (!busy) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`af-dialog${size === 'sm' ? ' is-sm' : ''}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape: stay open while a request is running, otherwise let the parent close it.
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      // The browser can still close it by itself (Escape pressed twice): keep the parent in sync.
      // The "close" event arrives late, so ignore it if the dialog has been opened again since.
      onClose={(e) => {
        if (open && !e.currentTarget.hasAttribute('open')) onClose();
      }}
      // A click on the dimmed area closes the dialog. Dragging a text selection out of
      // the panel must not, so the press has to start on the dimmed area too.
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === ref.current;
      }}
      onClick={(e) => {
        if (e.target === ref.current && pressStartedOnBackdrop.current) requestClose();
      }}
    >
      {open && (
        <div className="af-dialog-panel">
          <header className="af-dialog-head">
            {Icon && (
              <span className={`af-badge-icon is-sm${tone ? ` is-${tone}` : ''}`} aria-hidden="true">
                <Icon fontSize="inherit" />
              </span>
            )}
            <div className="af-dialog-heading">
              <h2 id={titleId} className="af-dialog-title">{title}</h2>
              {description && (
                <p id={descriptionId} className="af-dialog-desc">{description}</p>
              )}
            </div>
            <button
              type="button"
              className="af-icon-btn af-dialog-close"
              onClick={requestClose}
              disabled={busy}
              aria-label="Close"
            >
              <Close fontSize="inherit" />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function DialogBody({ children }) {
  return <div className="af-dialog-body">{children}</div>;
}

export function DialogFooter({ children }) {
  return <footer className="af-dialog-foot">{children}</footer>;
}
