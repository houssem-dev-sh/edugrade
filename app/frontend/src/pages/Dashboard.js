import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddOutlined from '@mui/icons-material/AddOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import ClassOutlined from '@mui/icons-material/ClassOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import PageHeader from '../layout/PageHeader';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Dialog from '../components/ui/Dialog';
import EmptyState from '../components/ui/EmptyState';
import SearchField from '../components/ui/SearchField';
import StatCard from '../components/ui/StatCard';
import { useToast } from '../components/ui/Toast';
import ClassBreakdown from '../components/ClassBreakdown';
import StudentForm from '../components/StudentForm';
import StudentTable from '../components/StudentTable';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { formatCount, pluralize, studentName, summarizeClasses } from '../utils/students';
import './dashboard.css';

const STUDENTS_URL = '/student/api/students';

const OFFLINE_MESSAGE = "Can't reach the server. Check your connection and try again.";
const failureMessage = (err, fallback) => (err instanceof TypeError ? OFFLINE_MESSAGE : fallback);

function Dashboard() {
  useDocumentTitle('Dashboard');
  const notify = useToast();

  const [students, setStudents] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | error
  const [search, setSearch] = useState('');

  // Add / edit dialog: null when closed, { student: null } to add, { student } to edit.
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete confirmation: the student waiting to be deleted, or null.
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const listTitleRef = useRef(null);
  const refocusList = useRef(false);

  // ================= LOAD =================
  const loadStudents = useCallback(async () => {
    try {
      const res = await fetch(STUDENTS_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
      setLoadState('ready');
      return true;
    } catch (err) {
      console.error('LOAD ERROR:', err);
      // A failed refresh keeps the list already on screen.
      setLoadState((state) => (state === 'ready' ? 'ready' : 'error'));
      return false;
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const retryLoad = () => {
    setLoadState('loading');
    loadStudents();
  };

  const refreshAfterChange = async () => {
    const refreshed = await loadStudents();
    if (!refreshed) notify("Done, but the list couldn't be refreshed. Reload the page.", 'error');
  };

  // ================= ADD / UPDATE =================
  const openEditor = (student) => {
    setSaveError('');
    setEditor({ student });
  };

  const closeEditor = () => {
    setEditor(null);
    setSaveError('');
  };

  const saveStudent = async (form) => {
    const editing = editor?.student ?? null;
    const isEdit = editing !== null;

    const url = isEdit ? `${STUDENTS_URL}/${editing.id}` : STUDENTS_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      classe: form.classe,
    };

    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('SAVE ERROR:', err);
      setSaveError(
        failureMessage(
          err,
          isEdit
            ? "We couldn't save your changes. Please try again."
            : "We couldn't add this student. Please try again."
        )
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditor(null);
    notify(isEdit ? 'Changes saved' : 'Student added');
    refreshAfterChange();
  };

  // ================= DELETE =================
  const askDelete = (student) => {
    setDeleteError('');
    setPendingDelete(student);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
    setDeleteError('');
  };

  const deleteStudent = async () => {
    const { id } = pendingDelete;

    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`${STUDENTS_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('DELETE ERROR:', err);
      setDeleteError(failureMessage(err, "We couldn't delete this student. Please try again."));
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setPendingDelete(null);
    notify('Student deleted');
    refocusList.current = true;
    refreshAfterChange();
  };

  // The deleted row took the keyboard focus away with it: hand it to the list title.
  useEffect(() => {
    if (!refocusList.current) return;
    refocusList.current = false;
    if (!document.activeElement || document.activeElement === document.body) {
      listTitleRef.current?.focus();
    }
  }, [students]);

  // ================= FILTER =================
  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ================= STATS =================
  const { classes, unassigned } = useMemo(() => summarizeClasses(students), [students]);
  const total = students.length;
  const isLoading = loadState === 'loading';
  const isReady = loadState === 'ready';

  let totalMeta = null;
  let classesMeta = null;
  if (isReady) {
    if (total === 0) totalMeta = 'No students yet';
    else if (unassigned > 0) totalMeta = `${formatCount(unassigned)} without a class`;
    else totalMeta = 'All assigned to a class';

    if (classes.length === 0) {
      classesMeta = 'No classes yet';
    } else {
      const average = (total - unassigned) / classes.length;
      const rounded = average.toLocaleString('en-US', { maximumFractionDigits: 1 });
      classesMeta = `${rounded} ${average === 1 ? 'student' : 'students'} per class on average`;
    }
  }

  // ================= STUDENT LIST =================
  let list;
  if (isLoading) {
    list = (
      <>
        <p className="af-visually-hidden" role="status">Loading students…</p>
        <div className="st-skeleton" aria-hidden="true">
          {[34, 26, 40, 30, 22].map((width) => (
            <div key={width} className="st-skeleton-row">
              <span className="af-skeleton st-skeleton-avatar" />
              <span className="st-skeleton-lines">
                <span className="af-skeleton" style={{ width: `${width}%` }} />
                <span className="af-skeleton" style={{ width: `${width + 14}%` }} />
              </span>
            </div>
          ))}
        </div>
      </>
    );
  } else if (loadState === 'error') {
    list = (
      <div className="st-message">
        <Alert
          action={
            <button type="button" className="af-link-btn af-alert-action" onClick={retryLoad}>
              Try again
            </button>
          }
        >
          We couldn't load your students. Check your connection and try again.
        </Alert>
      </div>
    );
  } else if (total === 0) {
    list = (
      <EmptyState
        icon={GroupsOutlined}
        title="No students yet"
        action={
          <Button icon={AddOutlined} onClick={() => openEditor(null)}>
            Add student
          </Button>
        }
      >
        Add your first student to start building your class lists.
      </EmptyState>
    );
  } else if (filteredStudents.length === 0) {
    list = (
      <EmptyState
        icon={SearchOffOutlined}
        title="No students found"
        action={
          <Button variant="secondary" onClick={() => setSearch('')}>
            Clear search
          </Button>
        }
      >
        Nothing matches “{search}”. Check the spelling or try another name or email.
      </EmptyState>
    );
  } else {
    list = (
      <>
        <StudentTable students={filteredStudents} onEdit={openEditor} onDelete={askDelete} />
        <p className="af-card-foot" role="status">
          {filteredStudents.length === total
            ? pluralize(total, 'student', 'students')
            : `Showing ${formatCount(filteredStudents.length)} of ${pluralize(total, 'student', 'students')}`}
        </p>
      </>
    );
  }

  const editing = editor?.student ?? null;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Manage your students and see how they are spread across classes."
        actions={
          <Button icon={AddOutlined} onClick={() => openEditor(null)}>
            Add student
          </Button>
        }
      />

      {/* ================= OVERVIEW ================= */}
      <div className="dash-overview">
        <div className="dash-stats">
          <StatCard
            icon={GroupsOutlined}
            label="Total students"
            value={isReady ? formatCount(total) : null}
            meta={totalMeta}
            loading={isLoading}
          />
          <StatCard
            icon={ClassOutlined}
            label="Classes"
            value={isReady ? formatCount(classes.length) : null}
            meta={classesMeta}
            loading={isLoading}
          />
        </div>
        <ClassBreakdown
          classes={classes}
          unassigned={unassigned}
          total={total}
          loading={isLoading}
          unavailable={loadState === 'error'}
        />
      </div>

      {/* ================= STUDENTS ================= */}
      <section className="af-card st-card" aria-labelledby="students-title">
        <div className="af-card-head">
          <div className="st-heading">
            <h2 id="students-title" ref={listTitleRef} tabIndex={-1} className="af-card-title">
              Students
            </h2>
            {isReady && <span className="af-badge tone-neutral">{formatCount(total)}</span>}
          </div>
          <SearchField
            className="st-search"
            label="Search students"
            placeholder="Search by name or email"
            value={search}
            onChange={setSearch}
          />
        </div>

        {list}
      </section>

      {/* ================= ADD / EDIT ================= */}
      <Dialog
        open={editor !== null}
        onClose={closeEditor}
        title={editing ? 'Edit student' : 'Add student'}
        description={
          editing
            ? 'Update the details below, then save your changes.'
            : 'Fill in the details below to add a student to your list.'
        }
        icon={editing ? EditOutlined : PersonAddAltOutlined}
        busy={saving}
      >
        <StudentForm
          selectedStudent={editing}
          onSave={saveStudent}
          onCancel={closeEditor}
          saving={saving}
          error={saveError}
        />
      </Dialog>

      {/* ================= DELETE ================= */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete student?"
        description={
          pendingDelete && (
            <>
              <strong>{studentName(pendingDelete)}</strong> will be removed from your list.
              This can't be undone.
            </>
          )
        }
        confirmLabel="Delete student"
        busyLabel="Deleting…"
        busy={deleting}
        error={deleteError}
        onConfirm={deleteStudent}
        onCancel={cancelDelete}
      />
    </>
  );
}

export default Dashboard;
