import { z } from "zod";

export const localTypeSchemaCreate = z.object({
  nombre: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
});

export const localTypeSchemaUpdate = localTypeSchemaCreate.partial();

export type LocalTypeSchema = z.infer<typeof localTypeSchemaCreate>;
