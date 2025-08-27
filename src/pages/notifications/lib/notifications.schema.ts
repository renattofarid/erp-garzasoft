import { z } from "zod";

export const notificationSchema = z.object({
  id: z.number().optional(),
  contrato_id: z.string().min(1, { message: "Contrato es requerido" }),
  detalle: z.string().max(500, { message: "Máximo 500 caracteres" }).optional(),
});

export const notificationSchemaCreate = z.object({
  contrato_id: z.string().min(1, { message: "Contrato es requerido" }),

  detalle: z.string().max(500, { message: "Máximo 500 caracteres" }).optional(),
});

export const notificationsSchemaUpdate = notificationSchemaCreate.partial();

export type NotificationsSchema = z.infer<typeof notificationSchemaCreate>;
