// Title block at the top of every app page. `actions` holds the page's main buttons.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="app-page-head">
      <div className="app-page-heading">
        <h1 className="app-page-title">{title}</h1>
        {subtitle && <p className="app-page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="app-page-actions">{actions}</div>}
    </header>
  );
}
