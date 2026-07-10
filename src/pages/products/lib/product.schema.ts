import { z } from "zod";

export const productTypeSchema = z.enum(["servicio", "producto"]);

const conceptSchema = z.object({
  nombre: z
    .string()
    .min(1, { message: "El nombre del concepto es obligatorio" }),
  precio_unitario: z.coerce
    .number()
    .min(0, "El precio debe ser mayor o igual a 0"),
});

export const productSchemaCreate = z.object({
  nombre: z
    .string()
    .min(1, { message: "El nombre es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" }),
  tipo: productTypeSchema,
  descripcion: z.string().optional().nullable(),
  modulos: z
    .array(conceptSchema)
    .min(1, { message: "Debe agregar al menos un concepto" })
    .superRefine((modulos, ctx) => {
      const nombres = new Map<string, number[]>();
      modulos.forEach((modulo, idx) => {
        const key = modulo.nombre.trim().toLowerCase();
        if (!nombres.has(key)) nombres.set(key, []);
        nombres.get(key)!.push(idx);
      });

      nombres.forEach((indices) => {
        if (indices.length > 1) {
          const lastIdx = indices[indices.length - 1];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No se permiten conceptos duplicados",
            path: [lastIdx, "nombre"],
          });
        }
      });
    }),
});

export const productSchemaUpdate = productSchemaCreate.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;
