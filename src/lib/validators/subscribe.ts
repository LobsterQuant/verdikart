import { z } from "zod";
import { emailSchema } from "./common";

export const subscribePostSchema = z.object({
  email: emailSchema,
  address: z.string().max(500).optional(),
});
