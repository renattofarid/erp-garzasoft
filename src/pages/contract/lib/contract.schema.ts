import { z } from "zod";

const isoDate = z.coerce
  .date()
  .transform((d) => d.toISOString().slice(0, 10))
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato valido: YYYY-MM-DD" })
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
    .int({ message: "Seleccione un cliente valido" })
    .positive({ message: "Seleccione un cliente valido" })
);

const productoModuloSchema = z.object({
  producto_id: z.coerce.number().int().positive({ message: "Producto invalido" }),
  modulo_id: z.coerce.number().int().positive({ message: "Modulo invalido" }),
  precio: z.coerce.number().nonnegative({ message: "El precio no puede ser negativo" }),
});

const cuotaSchema = z.object({
  monto: z.coerce.number().positive({ message: "El monto debe ser mayor que 0" }),
  fecha_vencimiento: isoDate,
});

const contractBaseObject = z.object({
  fecha_inicio: isoDate,
  fecha_fin: isoDate,
  numero: z.string().min(1, { message: "Numero de contrato obligatorio" }).max(100),
  cliente_padre_id: requiredClientId,
  cliente_id: requiredClientId,
  tipo_contrato: z.enum(["desarrollo", "saas", "soporte"]),
  vigencia_contrato: z.enum(["semestral", "anual"]),
  duracion_anios: z.coerce.number().int().min(1).default(1),
  total: z.coerce.number().nonnegative({ message: "El total no puede ser negativo" }),
  forma_pago: z.enum(["unico", "parcial"]),
  periodicidad_cuota: z.enum(["mensual", "anual"]),
  productos_modulos: z.array(productoModuloSchema).default([]),
  cuotas: z.array(cuotaSchema).optional().default([]),
});

const eq = (n: number) => Math.round(n * 100) / 100;

const validateContract = (
  data: z.infer<typeof contractBaseObject>,
  ctx: z.RefinementCtx
) => {
  const billingPeriods =
    data.periodicidad_cuota === "anual"
      ? data.vigencia_contrato === "anual"
        ? Math.max(data.duracion_anios || 1, 1)
        : 1
      : data.vigencia_contrato === "anual"
      ? Math.max((data.duracion_anios || 1) * 12, 1)
      : 6;

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

  if (data.vigencia_contrato === "anual" && (!data.duracion_anios || data.duracion_anios < 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debes indicar al menos 1 año de duración.",
      path: ["duracion_anios"],
    });
  }

  if (data.vigencia_contrato === "semestral" && data.periodicidad_cuota === "anual") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Un contrato semestral no puede tener pago anual.",
      path: ["periodicidad_cuota"],
    });
  }

  const map: Record<string, number[]> = {};
  (data.productos_modulos ?? []).forEach((pm, i) => {
    const key = `${pm.producto_id}-${pm.modulo_id}`;
    (map[key] ??= []).push(i);
  });
  Object.values(map).forEach((indices) => {
    if (indices.length > 1) {
      const last = indices[indices.length - 1];
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No se permiten duplicados de producto-modulo",
        path: ["productos_modulos", last],
      });
    }
  });

  if (data.tipo_contrato === "saas" && (data.productos_modulos?.length ?? 0) === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Para contratos SaaS debes seleccionar al menos un producto.",
      path: ["productos_modulos"],
    });
  }

  if (data.tipo_contrato === "saas") {
    const baseSum = (data.productos_modulos ?? []).reduce((acc, x) => acc + x.precio, 0);
    const expectedTotal = baseSum * billingPeriods;
    if (eq(data.total) !== eq(expectedTotal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El total (${eq(data.total)}) debe ser igual al valor del contrato segun su vigencia (${eq(expectedTotal)})`,
        path: ["total"],
      });
    }
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
      if (maxFecha && maxFecha.toISOString().slice(0, 10) > data.fecha_fin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La ultima cuota no puede vencer despues de la fecha fin del contrato",
          path: ["cuotas"],
        });
      }
    }
  }
};

export const contractCreateSchema = contractBaseObject.superRefine((data, ctx) =>
  validateContract(data, ctx)
);

export const contractUpdateSchema = contractBaseObject.partial().superRefine((data, ctx) =>
  validateContract(data as z.infer<typeof contractBaseObject>, ctx)
);

export type ContractCreate = z.output<typeof contractCreateSchema>;
export type ContractUpdate = z.infer<typeof contractUpdateSchema>;
export type ContractSchema = ContractCreate;
