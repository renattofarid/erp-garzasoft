import { z } from "zod";

// YYYY-MM-DD -> string
const isoDate = z.coerce
  .date()
  .transform((d) => d.toISOString().slice(0, 10))
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato válido: YYYY-MM-DD" })
  );

const productoModuloSchema = z.object({
  producto_id: z.coerce
    .number()
    .int()
    .positive({ message: "Producto inválido" }),
  modulo_id: z.coerce.number().int().positive({ message: "Módulo inválido" }),
  precio: z.coerce
    .number()
    .nonnegative({ message: "El precio no puede ser negativo" }),
});

// 1) Define el objeto base SIN superRefine
const contractBaseObject = z.object({
  fecha_inicio: isoDate,
  fecha_fin: isoDate,
  numero: z
    .string()
    .min(1, { message: "Número de contrato obligatorio" })
    .max(100),
  cliente_id: z.coerce.number().int().positive({ message: "Cliente Inválido" }),
  tipo_contrato: z.enum(["desarrollo", "saas", "soporte"], {
    message: "Solo se permite desarrollo, saas o soporte",
  }),
  total: z.coerce
    .number()
    .nonnegative({ message: "El total no puede ser negativo" }),
  forma_pago: z.enum(["unico", "parcial"], {
    message: "Solo se permite unico o parcial",
  }),
  productos_modulos: z
    .array(productoModuloSchema)
    .min(1, { message: "Debe agregar al menos un módulo" }),
});

// 2) CREATE: valida todo
export const contractCreateSchema = contractBaseObject.superRefine(
  (data, ctx) => {
    // fecha_fin >= fecha_inicio
    const ini = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);
    if (fin < ini) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha fin debe ser mayor o igual que la fecha de inicio",
        path: ["fecha_fin"],
      });
    }

    // duplicados (producto_id, modulo_id) — marcar solo el último
    const map: Record<string, number[]> = {};
    data.productos_modulos.forEach((pm, i) => {
      const key = `${pm.producto_id}-${pm.modulo_id}`;
      (map[key] ??= []).push(i);
    });
    Object.values(map).forEach((indices) => {
      if (indices.length > 1) {
        const last = indices[indices.length - 1];
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No se permiten duplicados de producto–módulo",
          path: ["productos_modulos", last],
        });
      }
    });

    // total === suma de precios
    const sum = data.productos_modulos.reduce((acc, x) => acc + x.precio, 0);
    const eq = (n: number) => Math.round(n * 100) / 100;
    if (eq(data.total) !== eq(sum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El total (${eq(
          data.total
        )}) debe ser igual a la suma de los módulos (${eq(sum)})`,
        path: ["total"],
      });
    }
  }
);

// 3) UPDATE: primero partial(), luego superRefine con validaciones condicionales
export const contractUpdateSchema = contractBaseObject
  .partial()
  .superRefine((data, ctx) => {
    // Solo valida si ambos están presentes
    if (data.fecha_inicio && data.fecha_fin) {
      const ini = new Date(data.fecha_inicio);
      const fin = new Date(data.fecha_fin);
      if (fin < ini) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha fin debe ser mayor o igual que la fecha de inicio",
          path: ["fecha_fin"],
        });
      }
    }

    // Duplicados si productos_modulos viene
    if (data.productos_modulos) {
      const map: Record<string, number[]> = {};
      data.productos_modulos.forEach((pm, i) => {
        const key = `${pm.producto_id}-${pm.modulo_id}`;
        (map[key] ??= []).push(i);
      });
      Object.values(map).forEach((indices) => {
        if (indices.length > 1) {
          const last = indices[indices.length - 1];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No se permiten duplicados de producto–módulo",
            path: ["productos_modulos", last],
          });
        }
      });

      // total si ambos vienen
      if (typeof data.total === "number") {
        const sum = data.productos_modulos.reduce(
          (acc, x) => acc + x.precio,
          0
        );
        const eq = (n: number) => Math.round(n * 100) / 100;
        if (eq(data.total) !== eq(sum)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El total (${eq(
              data.total
            )}) debe ser igual a la suma de los módulos (${eq(sum)})`,
            path: ["total"],
          });
        }
      }
    }
  });

export type ContractCreate = z.output<typeof contractCreateSchema>;
export type ContractUpdate = z.output<typeof contractUpdateSchema>;
export type ContractSchema = ContractCreate; // si tu form usa el create completo
