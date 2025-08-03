import { z } from "zod";

export const metricSchemaCreate = z.object({
  nombre: z.string().max(100).min(1),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type TypeUserSchema = z.infer<typeof metricSchemaCreate>;
