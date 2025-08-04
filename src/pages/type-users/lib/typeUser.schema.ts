import { z } from "zod";

export const metricSchemaCreate = z.object({
  nombre: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 100 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type TypeUserSchema = z.infer<typeof metricSchemaCreate>;
