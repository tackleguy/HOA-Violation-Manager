import { cn } from "@/lib/utils";

type FormStatusProps = {
  error?: string;
  message?: string;
  className?: string;
};

/** Announces form/page status to screen readers (WCAG 4.1.3). */
export function FormStatus({ error, message, className }: FormStatusProps) {
  if (!error && !message) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {error ? (
        <p id="form-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p id="form-message" role="status" aria-live="polite" className="text-sm text-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
