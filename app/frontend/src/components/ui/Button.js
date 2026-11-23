// variant: primary | secondary | ghost | danger
// size:    sm | md | lg
// `icon` / `iconEnd` take an icon component; `loading` swaps the content for a spinner.
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  loadingText,
  icon: Icon,
  iconEnd: IconEnd,
  type = 'button',
  disabled = false,
  className,
  children,
  ...rest
}) {
  const classes = ['af-btn', `af-btn-${variant}`];
  if (size !== 'md') classes.push(`af-btn-${size}`);
  if (block) classes.push('af-btn-block');
  if (className) classes.push(className);

  return (
    <button
      type={type}
      className={classes.join(' ')}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...rest}
    >
      {loading ? (
        <>
          <span className="af-spinner" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && (
            <span className="af-btn-icon" aria-hidden="true">
              <Icon fontSize="inherit" />
            </span>
          )}
          <span>{children}</span>
          {IconEnd && (
            <span className="af-btn-icon is-trailing" aria-hidden="true">
              <IconEnd fontSize="inherit" />
            </span>
          )}
        </>
      )}
    </button>
  );
}
