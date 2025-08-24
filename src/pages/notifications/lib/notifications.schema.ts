import { z } from "zod";

export const productSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, { message: "El nombre del módulo es obligatorio" }),
  precio_unitario: z.number().positive("El precio debe ser mayor a 0"),
});

export const productSchemaCreate = z.object({
  nombre: z
    .string()
    .min(1, { message: "El nombre del producto es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),
  descripcion: z.string().optional(),
  modulos: z
    .array(productSchema)
    .min(1, { message: "Debe agregar al menos un módulo" }),
});

export const productSchemaUpdate = productSchemaCreate.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;
