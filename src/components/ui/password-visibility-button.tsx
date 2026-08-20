"use client";

export function PasswordVisibilityButton({
  visible,
  onClick,
  label,
  disabled = false,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={visible}
      title={label}
      className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-[var(--text-muted)] hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {visible ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.3A10.8 10.8 0 0112 4c5.5 0 9 5.5 9 5.5a16 16 0 01-3 3.6M6.2 6.2C4.2 7.6 3 9.5 3 9.5S6.5 15 12 15a10.7 10.7 0 003-.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M3 12s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S3 12 3 12z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )}
    </button>
  );
}
