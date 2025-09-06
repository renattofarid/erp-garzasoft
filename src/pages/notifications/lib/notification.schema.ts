import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const notificationSchemaCreate = z.object({
  contrato_id: requiredStringId("El contrato es obligatorio"),
  detalle: z.string().optional(),
});

export const notificationSchemaUpdate = notificationSchemaCreate.partial();

export type NotificationSchema = z.infer<typeof notificationSchemaCreate>;
