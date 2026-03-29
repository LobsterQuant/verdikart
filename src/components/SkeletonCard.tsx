export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-6">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton mb-3 last:mb-0"
          style={{
            height: i === 0 ? "20px" : "14px",
            width: i === lines - 1 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}
