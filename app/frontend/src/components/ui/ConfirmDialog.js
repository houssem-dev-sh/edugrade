import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import Dialog, { DialogBody, DialogFooter } from './Dialog';
import Button from './Button';
import Alert from './Alert';

// Asks before a destructive action. Focus starts on "Cancel", the safe choice.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busyLabel,
  cancelLabel = 'Cancel',
  busy = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      icon={WarningAmberOutlined}
      tone="danger"
      size="sm"
      busy={busy}
    >
      {error && (
        <DialogBody>
          <Alert>{error}</Alert>
        </DialogBody>
      )}
      <DialogFooter>
        <Button variant="secondary" onClick={onCancel} disabled={busy} data-autofocus>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={busy} loadingText={busyLabel}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
