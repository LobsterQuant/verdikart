import { z } from "zod";
import { kommunenummerSchema, postnummerSchema } from "./common";

export const reviewsPostSchema = z.object({
  kommunenummer: kommunenummerSchema,
  postnummer: postnummerSchema,
  rating: z.number().int().min(1).max(5),
  pros: z.string().max(500).optional().nullable(),
  cons: z.string().max(500).optional().nullable(),
  livedYears: z.number().int().min(0).max(100).optional().nullable(),
});

// Relaxed: slugs without a parsed knr legitimately pass kommunenummer=""
// (see eiendom/[slug]/page.tsx). Empty / missing → empty-result fallback
// in the route. Malformed strings (non-4-digit) still rejected.
export const reviewsGetQuerySchema = z.object({
  kommunenummer: z
    .string()
    .regex(/^\d{4}$/, "Kommunenummer må være 4 siffer")
    .or(z.literal(""))
    .optional(),
  postnummer: z
    .string()
    .regex(/^\d{4}$/, "Postnummer må være 4 siffer")
    .or(z.literal(""))
    .optional(),
});
