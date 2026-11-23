// Must match the backend (OtpService: 6-digit codes, 5-minute expiry).
export const OTP_LENGTH = 6;
export const CODE_TTL_MINUTES = 5;

// Seconds before "Resend code" can be used again.
export const RESEND_COOLDOWN = 30;
