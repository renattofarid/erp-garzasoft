import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const facturadorSchema = z.object({
  empresa_id: z.string().trim().min(1, "El ID de la empresa es obligatorio"),
  ruc: z
    .string()
    .trim()
    .length(11, "El RUC debe tener 11 dígitos")
    .regex(/^\d+$/, "El RUC solo debe contener números"),
  razon_social: z.string().trim().min(1, "La razón social es obligatoria"),
  nombre_comercial: z.string().trim().min(1, "El nombre comercial es obligatorio"),
  direccion: z.string().trim().min(1, "La dirección fiscal es obligatoria"),
  usuario_sol: z.string().trim().min(1, "El usuario WSDL es obligatorio"),
  clave_sol: z.string().trim().min(1, "La contraseña WSDL es obligatoria"),
  token: optionalText,
  wsdl_factura: optionalText,
  wsdl_boleta: optionalText,
  wsdl_consulta: optionalText,
  wsdl_bajas: optionalText,
  modo: z.enum(["simulacion", "produccion"]),
  porcentaje_igv: z.coerce.number().min(0).max(100),
  activo: z.boolean().default(true),
});

export type FacturadorSchema = z.infer<typeof facturadorSchema>;
