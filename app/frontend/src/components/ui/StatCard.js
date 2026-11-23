// Headline figure: an icon, a label, one number and an optional line of context.
// Pass `value={null}` when the figure isn't available.
export default function StatCard({ icon: Icon, label, value, meta, loading = false }) {
  return (
    <div className="af-card af-stat">
      <span className="af-badge-icon is-sm" aria-hidden="true">
        <Icon fontSize="inherit" />
      </span>
      <div>
        <p className="af-stat-label">{label}</p>
        <p className="af-stat-value">
          {loading ? (
            <>
              <span className="af-skeleton" aria-hidden="true" />
              <span className="af-visually-hidden">Loading</span>
            </>
          ) : (
            value ?? (
              <>
                <span className="af-stat-none" aria-hidden="true">—</span>
                <span className="af-visually-hidden">Not available</span>
              </>
            )
          )}
        </p>
        {meta && !loading && <p className="af-stat-meta">{meta}</p>}
      </div>
    </div>
  );
}
