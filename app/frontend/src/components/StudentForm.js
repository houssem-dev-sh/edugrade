import PersonOutlined from '@mui/icons-material/PersonOutlined';
import MailOutlined from '@mui/icons-material/MailOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import ClassOutlined from '@mui/icons-material/ClassOutlined';
import TextField from './ui/TextField';
import Button from './ui/Button';
import Alert from './ui/Alert';
import { DialogBody, DialogFooter } from './ui/Dialog';
import useForm from '../hooks/useForm';

const EMPTY_STUDENT = { firstName: '', lastName: '', email: '', phone: '', classe: '' };

// Same rules as before the redesign: first name, last name and email are required,
// the email must look like an email, and a phone number (optional) is 8 to 15 digits.
const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const PHONE_PATTERN = /^[0-9]{8,15}$/;

const validators = {
  firstName: (value) => (value ? '' : 'Enter a first name.'),
  lastName: (value) => (value ? '' : 'Enter a last name.'),
  email: (value) => {
    if (!value) return 'Enter an email address.';
    return EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email address, like name@school.edu.';
  },
  phone: (value) =>
    value && !PHONE_PATTERN.test(value) ? 'Use 8 to 15 digits, with no spaces or symbols.' : '',
};

const optional = <span className="af-label-aside">Optional</span>;

// Add / edit form shown inside a dialog. Pass `selectedStudent` to edit, nothing to add.
function StudentForm({ selectedStudent, onSave, onCancel, saving = false, error = '' }) {
  const isEdit = Boolean(selectedStudent);
  const form = useForm(
    selectedStudent
      ? {
          firstName: selectedStudent.firstName || '',
          lastName: selectedStudent.lastName || '',
          email: selectedStudent.email || '',
          phone: selectedStudent.phone || '',
          classe: selectedStudent.classe || '',
        }
      : EMPTY_STUDENT,
    validators
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving || !form.validateAll(e.currentTarget)) return;
    onSave(form.values);
  };

  return (
    <form className="af-dialog-form" onSubmit={handleSubmit} noValidate>
      <DialogBody>
        <div className="af-form">
          {error && <Alert>{error}</Alert>}

          <div className="af-row-2">
            <TextField
              label="First name"
              icon={PersonOutlined}
              autoComplete="off"
              data-autofocus
              {...form.bind('firstName')}
            />
            <TextField
              label="Last name"
              icon={PersonOutlined}
              autoComplete="off"
              {...form.bind('lastName')}
            />
          </div>

          <TextField
            label="Email"
            icon={MailOutlined}
            inputMode="email"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="name@school.edu"
            {...form.bind('email')}
          />

          <div className="af-row-2">
            <TextField
              label="Phone"
              labelAside={optional}
              icon={PhoneOutlined}
              inputMode="numeric"
              autoComplete="off"
              hint="Digits only, 8 to 15."
              {...form.bind('phone')}
            />
            <TextField
              label="Class"
              labelAside={optional}
              icon={ClassOutlined}
              autoComplete="off"
              placeholder="e.g. 3A"
              {...form.bind('classe')}
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} loadingText={isEdit ? 'Saving…' : 'Adding…'}>
          {isEdit ? 'Save changes' : 'Add student'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default StudentForm;
