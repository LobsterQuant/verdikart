export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Verdikart logo"
    >
      {/* Map pin body */}
      <path
        d="M16 3C11.582 3 8 6.582 8 11c0 5.25 8 18 8 18s8-12.75 8-18c0-4.418-3.582-8-8-8z"
        fill="#0066FF"
        opacity="0.15"
      />
      <path
        d="M16 3C11.582 3 8 6.582 8 11c0 5.25 8 18 8 18s8-12.75 8-18c0-4.418-3.582-8-8-8z"
        stroke="#0066FF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Bar chart inside pin — 3 bars */}
      <rect x="11.5" y="12" width="2" height="3" rx="0.4" fill="#0066FF" />
      <rect x="15"   y="9"  width="2" height="6" rx="0.4" fill="#0066FF" />
      <rect x="18.5" y="10.5" width="2" height="4.5" rx="0.4" fill="#0066FF" />
    </svg>
  );
}
