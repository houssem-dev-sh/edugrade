import { formatCount, pluralize } from '../utils/students';

const MAX_ROWS = 5;

// "Students by class": one bar per class, largest first, all in the same colour.
// Students without a class get a grey row of their own, so nobody is left out.
// Every figure is printed next to its bar; hovering a row adds its share of the total.
function ClassBreakdown({ classes, unassigned, total, loading = false, unavailable = false }) {
  const shown = classes.slice(0, MAX_ROWS);
  const hidden = classes.slice(MAX_ROWS);
  const hiddenStudents = hidden.reduce((sum, item) => sum + item.count, 0);

  const rows = shown.map((item) => ({ key: `class:${item.name}`, label: item.name, count: item.count }));
  if (unassigned > 0) {
    rows.push({ key: 'unassigned', label: 'No class', count: unassigned, muted: true });
  }
  const largest = rows.reduce((max, row) => Math.max(max, row.count), 0);

  let body;
  if (loading) {
    body = (
      <div className="cb-list" aria-hidden="true">
        {[72, 54, 38, 22].map((width) => (
          <div key={width} className="cb-row">
            <span className="af-skeleton" style={{ width: '70%' }} />
            <span className="af-skeleton" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    );
  } else if (unavailable) {
    body = <p className="cb-empty">Not available right now.</p>;
  } else if (total === 0) {
    body = <p className="cb-empty">Classes will show up here once you add students.</p>;
  } else {
    body = (
      <ul className="cb-list">
        {rows.map((row, index) => {
          const share = Math.round((row.count / total) * 100);
          return (
            <li
              key={row.key}
              className={`cb-row${row.muted ? ' is-muted' : ''}`}
              title={`${row.label}: ${pluralize(row.count, 'student', 'students')} (${share}% of all students)`}
              style={{ '--ratio': row.count / largest, '--delay': `${index * 60}ms` }}
            >
              <span className="cb-name">{row.label}</span>
              <span className="cb-track">
                <span className="cb-bar" aria-hidden="true" />
                <span className="cb-value">
                  {formatCount(row.count)}
                  <span className="af-visually-hidden">
                    {row.count === 1 ? ' student' : ' students'}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className="af-card cb" aria-labelledby="class-breakdown-title">
      <div className="af-card-head">
        <h2 id="class-breakdown-title" className="af-card-title">Students by class</h2>
        {hidden.length > 0 && (
          <span className="cb-caption">Top {shown.length} of {formatCount(classes.length)}</span>
        )}
      </div>

      {body}

      {hidden.length > 0 && (
        <p className="af-card-foot cb-foot">
          + {pluralize(hidden.length, 'more class', 'more classes')} with{' '}
          {pluralize(hiddenStudents, 'student', 'students')}
        </p>
      )}
    </section>
  );
}

export default ClassBreakdown;
