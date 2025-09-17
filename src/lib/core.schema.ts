import { z } from "zod";

export const optionalNumericId = (message: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z
      .number()
      .optional()
      .refine((val) => val !== undefined, { message })
  );

export const optionalStringId = (message: string) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().min(1, message).optional()
  );

export const requiredStringId = (message: string) =>
  z
    .string()
    .min(1, message)
    .max(100, message)
    .refine((val) => val !== undefined, { message });

export function requiredNumber(object: string) {
  return z
    .string()
    .min(1, `${object} es requerido`)
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: `${object} debe ser un número válido`,
    })
    .refine((val) => val >= 0, {
      message: `${object} debe ser mayor o igual a 0`,
    });
}

export const onlyLettersSchema = (field: string) =>
  z
    .string()
    .max(255, `El ${field} no puede exceder 255 caracteres`)
    .refine((val) => !val || /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(val), {
      message: `El ${field} solo puede contener letras y espacios`,
    })
    .optional()
    .or(z.literal("")); // si quieres permitir vacío explícito
