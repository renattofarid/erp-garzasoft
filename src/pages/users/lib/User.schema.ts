import { z } from "zod";

export const metricSchemaCreate = z.object({
  usuario : z.string().nonempty("El usuario es obligatorio"),
  contraseña: z.string().nonempty("La contraseña es obligatoria"),
    tipo_usuario_id: z.number().int().positive("El tipo de usuario es obligatorio"),

  tipo_documento: z.enum(["", "DNI", "RUC", "CE"]),
  // type_person: z.enum(["", "NATURAL", "JURIDICA"]),
  numero_docuemnto: z.string().nonempty(),
  nombres: z.string().max(100).min(1),
  names: z.string().nonempty(),
  father_surname: z.string().optional(),
  mother_surname: z.string().optional(),
  telefono: z
    .string()
    .nonempty("El teléfono es obligatorio")
    .regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos"),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type UserSchema = z.infer<typeof metricSchemaCreate>;
