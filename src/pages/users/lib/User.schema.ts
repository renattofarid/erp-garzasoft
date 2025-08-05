import { z } from "zod";

export const metricSchemaCreate = z.object({
  usuario: z.string().nonempty("El usuario es obligatorio"),
  nombres: z.string().max(100).min(1, "El nombre es obligatorio"),
  apellidos: z.string().max(100).min(1, "El apellido es obligatorio"),
  tipo_usuario_id: z
    .number()
    .int()
    .positive("El tipo de usuario es obligatorio"),
  password: z.string().nonempty("La contraseña es obligatoria"),

  // tipo_documento: z.enum(["", "DNI", "RUC", "CE"]),
  // type_person: z.enum(["", "NATURAL", "JURIDICA"]),
  // numero_docuemnto: z.string().nonempty(),
  // names: z.string().nonempty(),
  // father_surname: z.string().optional(),
  // mother_surname: z.string().optional(),
  // password: z.string().nonempty("La contraseña es obligatoria"),
  // telefono: z
  //   .string()
  //   .nonempty("El teléfono es obligatorio")
  //   .regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos"),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type UserSchema = z.infer<typeof metricSchemaCreate>;
