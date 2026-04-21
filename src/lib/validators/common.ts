import { z } from "zod";

export const kommunenummerSchema = z
  .string()
  .regex(/^\d{4}$/, "Kommunenummer må være 4 siffer");

export const postnummerSchema = z
  .string()
  .regex(/^\d{4}$/, "Postnummer må være 4 siffer")
  .optional()
  .nullable();

export const uuidSchema = z.string().uuid("Ugyldig id-format");

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9-]+$/i, "Ugyldig slug");

export const coordinateSchema = z.number().finite();

export const emailSchema = z.string().email("Ugyldig e-post").max(254);
