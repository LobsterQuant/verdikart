"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquare, ChevronDown, Send } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { nb } from "@/lib/format";

interface Review {
  id: string;
  rating: number;
  pros: string | null;
  cons: string | null;
  livedYears: number | null;
  createdAt: string;
  userName: string;
}

interface ReviewsData {
  reviews: Review[];
  avgRating: number | null;
  count: number;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-text-tertiary"}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

export default function NeighborhoodReviewsCard({
  kommunenummer,
  postnummer,
}: {
  kommunenummer: string;
  postnummer?: string;
}) {
  const { data: session } = useSession();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formPros, setFormPros] = useState("");
  const [formCons, setFormCons] = useState("");
  const [formYears, setFormYears] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(
          `/api/reviews?kommunenummer=${kommunenummer}&postnummer=${postnummer ?? ""}`
        );
        if (!res.ok) throw new Error("Failed");
        setData(await res.json());
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [kommunenummer, postnummer]);

  async function handleSubmit() {
    if (submitting || formRating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kommunenummer,
          postnummer,
          rating: formRating,
          pros: formPros || null,
          cons: formCons || null,
          livedYears: formYears ? parseInt(formYears) : null,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
        // Refresh reviews
        const refreshRes = await fetch(
          `/api/reviews?kommunenummer=${kommunenummer}&postnummer=${postnummer ?? ""}`
        );
        if (refreshRes.ok) setData(await refreshRes.json());
      }
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-40" />
        <div className="skeleton h-16 w-full" />
      </div>
    );
  }

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-accent" />
          Nabolagsvurdering
        </h3>
        {data && data.avgRating !== null && (
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(data.avgRating)} />
            <span className="text-sm font-medium tabular-nums">
              {nb(data.avgRating)}
            </span>
            <span className="text-xs text-text-secondary">
              ({data.count})
            </span>
          </div>
        )}
      </div>

      {/* Reviews list */}
      {data && data.reviews.length > 0 ? (
        <div className="space-y-3">
          {data.reviews.slice(0, expanded ? 10 : 2).map((r) => (
            <div key={r.id} className="rounded-lg bg-background p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} size={12} />
                  <span className="text-xs text-text-secondary">{r.userName}</span>
                </div>
                {r.livedYears != null && (
                  <span className="text-[10px] text-text-secondary">
                    Bodd {r.livedYears} år
                  </span>
                )}
              </div>
              {r.pros && (
                <p className="text-xs text-green-400">
                  <span className="font-medium">+</span> {r.pros}
                </p>
              )}
              {r.cons && (
                <p className="mt-0.5 text-xs text-red-400">
                  <span className="font-medium">−</span> {r.cons}
                </p>
              )}
            </div>
          ))}

          {data.reviews.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              {expanded ? "Vis færre" : `Vis alle ${data.reviews.length} vurderinger`}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      ) : (
        <p className="mb-3 text-sm text-text-secondary">
          Ingen vurderinger ennå. Bli den første!
        </p>
      )}

      {/* Write review form */}
      {session?.user && !submitted && (
        <div className="mt-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-xs font-medium text-accent hover:underline"
            >
              <Star className="h-3.5 w-3.5" />
              Skriv en vurdering
            </button>
          ) : (
            <div className="rounded-lg border border-card-border bg-background p-3">
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Din vurdering
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setFormRating(i)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i <= formRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-text-tertiary hover:text-yellow-400/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Fordeler (valgfritt)"
                  value={formPros}
                  onChange={(e) => setFormPros(e.target.value)}
                  maxLength={500}
                  className="w-full rounded-md border border-card-border bg-card-bg px-3 py-1.5 text-xs placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Ulemper (valgfritt)"
                  value={formCons}
                  onChange={(e) => setFormCons(e.target.value)}
                  maxLength={500}
                  className="w-full rounded-md border border-card-border bg-card-bg px-3 py-1.5 text-xs placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
              </div>
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="År bodd"
                  value={formYears}
                  onChange={(e) => setFormYears(e.target.value)}
                  min={0}
                  max={50}
                  className="w-20 rounded-md border border-card-border bg-card-bg px-3 py-1.5 text-xs placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
                <span className="text-xs text-text-secondary">år i området</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={formRating === 0 || submitting}
                  className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  {submitting ? "Sender…" : "Send inn"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-md px-3 py-1.5 text-xs text-text-secondary hover:text-foreground"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <p className="mt-3 text-xs font-medium text-green-400">
          Takk for din vurdering!
        </p>
      )}
    </TopographicHover>
  );
}
