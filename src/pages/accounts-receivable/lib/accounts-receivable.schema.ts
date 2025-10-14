import { z } from "zod";

// Schema para situación de cuota
export const situacionCuotaSchema = z.enum(["pendiente", "pagado", "vencido"]);

// Schema principal para cuentas por cobrar
export const cuentasPorCobrarSchemaCreate = z.object({
  contrato_id: z.coerce
    .number()
    .int()
    .positive({ message: "El contrato es obligatorio" }),
  monto: z.coerce
    .number()
    .positive({ message: "El monto debe ser mayor que 0" }),
  fecha_vencimiento: z
    .string()
    .min(1, { message: "La fecha de vencimiento es obligatoria" }),
  fecha_pago: z.string().nullable().optional(),
  situacion: situacionCuotaSchema,
  pagos_cuota: z.array(z.any()).optional(), // Para los archivos
});

export const cuentasPorCobrarSchemaUpdate =
  cuentasPorCobrarSchemaCreate.partial();

// Schema para pagos
export const pagoSchemaCreate = z.object({
  cuota_id: z.coerce
    .number()
    .int()
    .positive({ message: "La cuota es obligatoria" }),
  fecha_pago: z.string().min(1, { message: "La fecha de pago es obligatoria" }),
  monto_pagado: z.coerce
    .number()
    .positive({ message: "El monto pagado debe ser mayor que 0" }),
  comprobante: z.any().optional(), // Para el archivo
  pagos_cuota: z.array(z.any()).optional(), 
  monto_pendiente: z.number().optional(), 
  monto_total: z.number().optional(), 
});

export const pagoSchemaUpdate = pagoSchemaCreate.partial();

export type CuentasPorCobrarSchema = z.infer<
  typeof cuentasPorCobrarSchemaCreate
>;
export type PagoSchema = z.infer<typeof pagoSchemaCreate>;
