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

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const requiredClientId = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number()
    .int({ message: "Seleccione un cliente válido" })
    .positive({ message: "Seleccione un cliente válido" })
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

const cuotaSchema = z.object({
  monto: z.coerce
    .number()
    .positive({ message: "El monto debe ser mayor que 0" }),
  fecha_vencimiento: isoDate,
});

// 1) Define el objeto base SIN superRefine
const contractBaseObject = z.object({
  fecha_inicio: isoDate,
  fecha_fin: isoDate,
  numero: z
    .string()
    .min(1, { message: "Número de contrato obligatorio" })
    .max(100),
  cliente_padre_id: requiredClientId,
  cliente_id: requiredClientId,
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
  cuotas: z.array(cuotaSchema).optional(),
});

// helper para comparar decimales
const eq = (n: number) => Math.round(n * 100) / 100;

// 2) CREATE: valida todo
export const contractCreateSchema = contractBaseObject.superRefine(
  (data, ctx) => {
    const ini = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);
    if (fin < ini) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha fin debe ser mayor o igual que la fecha de inicio",
        path: ["fecha_fin"],
      });
    }

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
          message: "No se permiten duplicados de producto-módulo",
          path: ["productos_modulos", last],
        });
      }
    });

    const sum = data.productos_modulos.reduce((acc, x) => acc + x.precio, 0);
    if (eq(data.total) !== eq(sum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El total (${eq(data.total)}) debe ser igual a la suma de los módulos (${eq(sum)})`,
        path: ["total"],
      });
    }

    if (data.forma_pago === "parcial") {
      if (!data.cuotas || data.cuotas.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe agregar al menos una cuota",
          path: ["cuotas"],
        });
      } else {
        const sumCuotas = data.cuotas.reduce((acc, c) => acc + c.monto, 0);
        if (eq(sumCuotas) !== eq(data.total)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La suma de las cuotas (${eq(sumCuotas)}) debe ser igual al total (${eq(data.total)})`,
            path: ["cuotas"],
          });
        }

        const maxFecha = data.cuotas
          .map((c) => new Date(c.fecha_vencimiento))
          .sort((a, b) => a.getTime() - b.getTime())
          .pop();
        if (maxFecha && maxFecha.toISOString().slice(0, 10) !== data.fecha_fin) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "La fecha de la última cuota debe coincidir con la fecha fin del contrato",
            path: ["cuotas"],
          });
        }
      }
    }
  }
);

// 3) UPDATE: partial() y validaciones condicionales
export const contractUpdateSchema = contractBaseObject
  .partial()
  .superRefine((data, ctx) => {
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
            message: "No se permiten duplicados de producto-módulo",
            path: ["productos_modulos", last],
          });
        }
      });

      if (typeof data.total === "number") {
        const sum = data.productos_modulos.reduce((acc, x) => acc + x.precio, 0);
        if (eq(data.total) !== eq(sum)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El total (${eq(data.total)}) debe ser igual a la suma de los módulos (${eq(sum)})`,
            path: ["total"],
          });
        }
      }
    }

    if (data.forma_pago === "parcial" && data.cuotas) {
      if (typeof data.total === "number") {
        const sumCuotas = data.cuotas.reduce((acc, c) => acc + c.monto, 0);
        if (eq(sumCuotas) !== eq(data.total)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La suma de las cuotas (${eq(sumCuotas)}) debe ser igual al total (${eq(data.total)})`,
            path: ["cuotas"],
          });
        }
      }

      if (data.fecha_fin) {
        const maxFecha = data.cuotas
          .map((c) => new Date(c.fecha_vencimiento))
          .sort((a, b) => a.getTime() - b.getTime())
          .pop();
        if (maxFecha && maxFecha.toISOString().slice(0, 10) !== data.fecha_fin) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "La fecha de la última cuota debe coincidir con la fecha fin del contrato" +
              (data.fecha_fin ? ` (${data.fecha_fin})` : ""),
            path: ["cuotas"],
          });
        }
      }
    }
  });

export type ContractCreate = z.output<typeof contractCreateSchema>;
export type ContractUpdate = z.infer<typeof contractUpdateSchema>;
export type ContractSchema = ContractCreate;
