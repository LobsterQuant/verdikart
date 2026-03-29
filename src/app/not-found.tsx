import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6">
      <h1 className="text-8xl font-bold tracking-tighter text-foreground/20">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight">
        Denne siden finnes ikke
      </h2>
      <p className="mt-3 text-sm text-text-secondary text-center max-w-md">
        Adressen du leter etter eksisterer ikke, eller har blitt flyttet.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80"
      >
        Tilbake til forsiden
      </Link>
    </div>
  );
}
