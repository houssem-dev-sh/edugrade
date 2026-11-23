import ArrowForward from '@mui/icons-material/ArrowForward';
import Button from '../ui/Button';

// Full-width primary action of a sign-in form.
export default function SubmitButton({ loading, loadingText, disabled, children }) {
  return (
    <Button
      type="submit"
      size="lg"
      block
      loading={loading}
      loadingText={loadingText}
      disabled={disabled}
      iconEnd={ArrowForward}
    >
      {children}
    </Button>
  );
}
