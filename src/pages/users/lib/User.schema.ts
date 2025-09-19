import { onlyLettersSchema } from "@/lib/core.schema";
import { z } from "zod";

export const metricSchemaCreate = z.object({
  usuario: onlyLettersSchema("usuario"),
  nombres: onlyLettersSchema("nombre"),
  apellidos: onlyLettersSchema("apellido"),
  tipo_usuario_id: z
    .number()
    .int()
    .positive("El tipo de usuario es obligatorio"),
  password: z.string().nonempty("La contraseña es obligatoria"),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type UserSchema = z.infer<typeof metricSchemaCreate>;
