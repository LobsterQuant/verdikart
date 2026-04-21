import { z } from "zod";
import { kommunenummerSchema, postnummerSchema, uuidSchema } from "./common";

export const alertsPostSchema = z.object({
  kommunenummer: kommunenummerSchema,
  postnummer: postnummerSchema,
  thresholdPct: z.number().min(0.1).max(100).optional(),
});

export const alertsDeleteSchema = z.object({
  id: uuidSchema,
});
