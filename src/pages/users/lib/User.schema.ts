import { onlyLettersSchema } from "@/lib/core.schema";
import { string, z } from "zod";

export const metricSchemaCreate = z.object({
  usuario: onlyLettersSchema("usuario"),
  nombres: string().nonempty("El nombre es obligatorio"),
  apellidos: string().nonempty("El apellido es obligatorio"),
  tipo_usuario_id: z
    .string()
    .nonempty("El tipo de usuario es obligatorio"),
  password: z.string().nonempty("La contraseña es obligatoria"),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type UserSchema = z.infer<typeof metricSchemaCreate>;
