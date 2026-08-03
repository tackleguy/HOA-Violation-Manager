import Link from "next/link";

/** Skip link for keyboard users — first focusable element in the document. */
export function SkipLink({ href = "#main-content" }: { href?: string }) {
  return (
    <Link href={href} className="skip-link">
      Skip to main content
    </Link>
  );
}
