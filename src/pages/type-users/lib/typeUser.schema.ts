import { z } from "zod";

export const typeUserSchemaCreate = z.object({
  nombre: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 100 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
});

export const typeUserSchemaUpdate = typeUserSchemaCreate.partial();

export type TypeUserSchema = z.infer<typeof typeUserSchemaCreate>;
