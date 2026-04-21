import { z } from "zod";
import {
  coordinateSchema,
  kommunenummerSchema,
  postnummerSchema,
  slugSchema,
} from "./common";

export const savedPropertiesPostSchema = z.object({
  slug: slugSchema,
  address: z.string().min(1).max(300),
  lat: coordinateSchema,
  lon: coordinateSchema,
  kommunenummer: kommunenummerSchema.optional(),
  postnummer: postnummerSchema,
});

export const savedPropertiesPatchSchema = z.object({
  slug: slugSchema,
  notes: z.string().max(1000).optional().nullable(),
});

export const savedPropertiesDeleteSchema = z.object({
  slug: slugSchema,
});
