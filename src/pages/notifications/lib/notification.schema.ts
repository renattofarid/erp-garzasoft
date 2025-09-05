import { z } from "zod";

export const notificationSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, { message: "El nombre del módulo es obligatorio" }),
  precio_unitario: z.number().positive("El precio debe ser mayor a 0"),
});

export const notificationSchemaCreate = z.object({
  nombre: z
    .string()
    .min(1, { message: "El nombre del notificationo es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),
  descripcion: z.string().optional(),
  modulos: z
    .array(notificationSchema)
    .min(1, { message: "Debe agregar al menos un módulo" }),
});

export const notificationSchemaUpdate = notificationSchemaCreate.partial();

export type NotificationSchema = z.infer<typeof notificationSchemaCreate>;
