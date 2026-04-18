"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, User } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-card-border animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:text-foreground"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Logg inn</span>
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-lg border border-card-border px-2 py-1.5 text-sm transition-colors hover:border-accent"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
            unoptimized
          />
        ) : (
          <User className="h-5 w-5 text-text-secondary" />
        )}
        <span className="hidden max-w-[120px] truncate text-sm sm:inline">
          {session.user?.name?.split(" ")[0] ?? "Konto"}
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-card-border bg-card-bg p-1 shadow-lg">
          <a
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-foreground"
          >
            <User className="h-4 w-4" />
            Mine eiendommer
          </a>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logg ut
          </button>
        </div>
      )}
    </div>
  );
}
