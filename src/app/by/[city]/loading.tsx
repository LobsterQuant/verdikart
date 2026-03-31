export default function CityLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-card-border border-t-accent" />
        <p className="text-sm text-text-secondary">Laster bydata...</p>
      </div>
    </div>
  );
}
