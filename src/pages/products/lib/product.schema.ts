import { z } from "zod";

export const productSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, { message: "El nombre del módulo es obligatorio" })
    .regex(/^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,-]+$/, { message: "Debe contener caracteres alfanuméricos" }),
  precio_unitario: z.number().positive("El precio debe ser mayor a 0"),
});

export const productSchemaCreate = z.object({
  nombre: z
    .string()
    .min(1, { message: "El nombre del producto es obligatorio" })
    .max(255, { message: "Máximo 255 caracteres" })
    .regex(/^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,-]+$/, { message: "Debe contener caracteres alfanuméricos" }),
  descripcion: z.string().regex(/^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,-]+$/, { message: "Debe contener caracteres alfanuméricos" }).optional(),
  modulos: z
    .array(productSchema)
    .min(1, { message: "Debe agregar al menos un módulo" })
    .superRefine((modulos, ctx) => {
      // Creamos un mapa para rastrear los nombres y su último índice
      const nombreIndices: Record<string, number[]> = {};
      modulos.forEach((modulo, idx) => {
        const nombre = modulo.nombre.trim().toLowerCase();
        if (!nombreIndices[nombre]) {
          nombreIndices[nombre] = [];
        }
        nombreIndices[nombre].push(idx);
      });

      // Para cada nombre duplicado, solo marcamos error en el último índice
      Object.entries(nombreIndices).forEach(([_, indices]) => {
        if (indices.length > 1) {
          // Solo el último debe mostrar el error
          const lastIdx = indices[indices.length - 1];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No se permiten módulos duplicados (nombre repetido)",
            path: [lastIdx, "nombre"],
          });
        }
      });
    }),
});

export const productSchemaUpdate = productSchemaCreate.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;
