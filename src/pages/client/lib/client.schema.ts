import { z } from "zod";

export const typeClientSchema = z.enum(["corporacion", "persona natural"]);

export const clientContactSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  celular: z.string().min(1, "El celular es requerido"),
  email: z.string().email("El email es inválido"),
});

export const metricSchemaCreate = z.object({
  tipo: z
    .string()
    .min(1, "El tipo es requerido")
    .refine((value) => typeClientSchema.safeParse(value).success, {
      message:
        "Tipo de cliente inválido. Debe ser 'corporacion' o 'persona natural'.",
    }),
  ruc: z.string().min(1, "El RUC es requerido"),
  razon_social: z.string().min(1, "La razón social es requerida"),
  dueno_nombre: z.string().min(1, "El nombre del dueño es requerido"),
  dueno_celular: z.string().min(1, "El celular del dueño es requerido"),
  dueno_email: z.string().email("El email del dueño es inválido"),
  representante_nombre: z
    .string()
    .min(1, "El nombre del representante es requerido"),
  representante_celular: z
    .string()
    .min(1, "El celular del representante es requerido"),
  representante_email: z
    .string()
    .email("El email del representante es inválido"),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type ClientSchema = z.infer<typeof metricSchemaCreate>;
