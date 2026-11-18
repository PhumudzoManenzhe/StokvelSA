import { Link } from "react-router-dom";

/**
 * The mark is three arcs closing on one another around a centre point: the
 * circle a stokvel moves its money around, and the people standing in it.
 * It inherits its colour, so it works on any background.
 */
export default function BrandMark({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="16"
        cy="16"
        r="10"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="15 5.944"
        transform="rotate(-90 16 16)"
      />
      <circle cx="16" cy="16" r="2.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Mark plus name, as it appears in the navigation, the sidebar and the auth
 * screens. `tone="light"` is for placement on a dark or photographic surface.
 */
export function Wordmark({ to = "/", tone = "default", className = "" }) {
  const isLight = tone === "light";

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 rounded-xl ${className}`}
      aria-label="StokvelSA home"
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          isLight ? "bg-white text-primary-700" : "bg-primary-600 text-white"
        }`}
      >
        <BrandMark size={21} />
      </span>
      <span
        className={`font-display text-lg font-semibold tracking-tight ${
          isLight ? "text-white" : "text-stone-900"
        }`}
      >
        StokvelSA
      </span>
    </Link>
  );
}
