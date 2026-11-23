/* eslint-disable jsx-a11y/no-redundant-roles --
   When its card is narrow (phones) this table is laid out as a list of cards, see dashboard.css.
   Safari forgets that a <table> is a table once its `display` is changed, so the roles
   are spelled out to keep it readable as a table by screen readers on every device. */
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import Avatar from './ui/Avatar';
import { studentInitials, studentName } from '../utils/students';

const none = (
  <>
    <span className="st-none" aria-hidden="true">—</span>
    <span className="af-visually-hidden">Not provided</span>
  </>
);

function StudentTable({ students, onEdit, onDelete }) {
  return (
    <div className="af-table-wrap">
      <table className="af-table st-table" role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader" scope="col" className="st-col-id">ID</th>
            <th role="columnheader" scope="col">Student</th>
            <th role="columnheader" scope="col" className="st-col-phone">Phone</th>
            <th role="columnheader" scope="col" className="st-col-class">Class</th>
            <th role="columnheader" scope="col" className="st-col-actions">
              <span className="af-visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody role="rowgroup">
          {students.map((s) => {
            const name = studentName(s);
            return (
              <tr role="row" key={s.id}>
                <td role="cell" className="st-cell-id af-num">{s.id}</td>

                <td role="cell" className="st-cell-student">
                  <div className="st-person">
                    <Avatar name={name} initials={studentInitials(s)} seed={s.id} />
                    <div className="st-person-text">
                      <span className="st-name" title={name}>{name}</span>
                      <span className="st-email" title={s.email}>{s.email}</span>
                    </div>
                  </div>
                </td>

                <td role="cell" className={`st-cell-phone af-num${s.phone ? '' : ' is-empty'}`}>
                  {s.phone || none}
                </td>

                <td role="cell" className={`st-cell-class${s.classe ? '' : ' is-empty'}`}>
                  {s.classe ? <span className="af-badge" title={s.classe}>{s.classe}</span> : none}
                </td>

                <td role="cell" className="st-cell-actions">
                  <div className="st-actions">
                    <button
                      type="button"
                      className="af-icon-btn"
                      onClick={() => onEdit(s)}
                      aria-label={`Edit ${name}`}
                      title="Edit"
                    >
                      <EditOutlined fontSize="inherit" />
                    </button>
                    <button
                      type="button"
                      className="af-icon-btn is-danger"
                      onClick={() => onDelete(s)}
                      aria-label={`Delete ${name}`}
                      title="Delete"
                    >
                      <DeleteOutlined fontSize="inherit" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
