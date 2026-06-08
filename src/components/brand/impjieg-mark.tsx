export function ImpjiegMark({
  size = 40,
  className = "",
  title = "Impjieg",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="18" fill="#08111F" />
      <path
        d="M18 43C24.5 35.5 31.5 32 40 28C43.2 26.5 45.8 24.5 48 21"
        stroke="#2563EB"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="18" r="5.5" fill="#14C7B7" />
      <rect x="28" y="27" width="8" height="21" rx="4" fill="#F7F4EC" />
      <circle cx="48" cy="21" r="4" fill="#14C7B7" />
    </svg>
  );
}
