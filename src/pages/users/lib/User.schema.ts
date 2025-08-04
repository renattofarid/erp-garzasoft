import { z } from "zod";

export const metricSchemaCreate = z.object({
  nombres: z.string().max(100).min(1),
  apellidos: z.string().max(100).min(1),
  usuario: z.string().max(50).min(1),
  tipo_usuario_id: z.number().int().positive(),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type UserSchema = z.infer<typeof metricSchemaCreate>;
