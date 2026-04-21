import { z } from "zod";
import { NextResponse } from "next/server";

export function parseOrBadRequest<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        {
          error: "Ugyldig forespørsel",
          issues: result.error.issues.map((i) => ({ path: i.path, message: i.message })),
        },
        { status: 400 },
      ),
    };
  }
  return { data: result.data, error: null };
}
