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

export const reviewsGetQuerySchema = z.object({
  kommunenummer: kommunenummerSchema,
  postnummer: postnummerSchema,
});
