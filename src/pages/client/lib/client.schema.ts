import { z } from "zod";
import { type ClientTypeUi } from "./client.interface";

const phoneError = "Número de celular inválido. Debe tener 9 dígitos.";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalText = z.preprocess(emptyToUndefined, z.string().optional());

const optionalPhone = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^[0-9]+$/, { message: "Solo se permiten números" })
    .length(9, phoneError)
    .optional()
);

const optionalDni = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^[0-9]+$/, { message: "Solo se permiten números" })
    .length(8, "El DNI debe tener 8 dígitos")
    .optional()
);

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email({ message: "Correo inválido" }).optional()
);

export const typeClientSchema = z.enum(["corporacion", "empresa", "local"]);

const contactSchema = z.object({
  dni: optionalDni,
  nombre: z.string().trim().min(1, "El nombre completo es requerido"),
  celular: optionalPhone,
  email: optionalEmail,
});

const looseContactSchema = z.object({
  dni: optionalDni,
  nombre: optionalText,
  celular: optionalPhone,
  email: optionalEmail,
});

const createClientNodeSchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      tipo: typeClientSchema,
      ruc: optionalText,
      razon_social: optionalText,
      nombre_comercial: optionalText,
      direccion: optionalText,
      tipos_local: z.array(z.string().trim().min(1)).default([]),
      contacto: looseContactSchema,
      contactos: z.array(contactSchema).optional().default([]),
      contacto_igual_empresa: z.boolean().optional().default(false),
      hijos: z.array(createClientNodeSchema).default([]),
    })
    .superRefine((data, ctx) => {
      if (!data.nombre_comercial) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nombre_comercial"],
          message: "El nombre comercial es obligatorio.",
        });
      }

      if ((data.tipo === "empresa" || data.tipo === "local") && !data.direccion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["direccion"],
          message: "La dirección es obligatoria para empresas y locales.",
        });
      }

      if (data.tipo === "local" && (!data.tipos_local || data.tipos_local.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tipos_local"],
          message: "Debes seleccionar al menos un tipo de local.",
        });
      }

      const hasPrincipalContact =
        Boolean(data.contacto?.nombre) || Boolean(data.contactos?.[0]?.nombre);

      if (!hasPrincipalContact) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: data.contactos?.length ? ["contactos", 0, "nombre"] : ["contacto", "nombre"],
          message: "El nombre completo del contacto es obligatorio.",
        });
      }

      if (data.tipo === "corporacion" && data.hijos.some((child: any) => child?.tipo !== "empresa")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hijos"],
          message: "La corporación solo puede contener empresas.",
        });
      }

      if (data.tipo === "empresa" && data.hijos.some((child: any) => child?.tipo !== "local")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hijos"],
          message: "La empresa solo puede contener locales.",
        });
      }
    })
);

export const clientSchemaCreate = createClientNodeSchema;
export const clientSchemaUpdate = createClientNodeSchema;

export type ClientSchema = z.infer<typeof createClientNodeSchema>;

export const normalizeNodeType = (tipo?: string | null): ClientTypeUi =>
  tipo === "empresa" ? "empresa" : tipo === "corporacion" ? "corporacion" : "local";
