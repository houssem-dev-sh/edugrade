// Shown in place of content that doesn't exist yet (no rows, no search results).
export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="af-empty">
      {Icon && (
        <span className="af-badge-icon is-neutral" aria-hidden="true">
          <Icon fontSize="inherit" />
        </span>
      )}
      <h3 className="af-empty-title">{title}</h3>
      {children && <p className="af-empty-text">{children}</p>}
      {action && <div className="af-empty-action">{action}</div>}
    </div>
  );
}
