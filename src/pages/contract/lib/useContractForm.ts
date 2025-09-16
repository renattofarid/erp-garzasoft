import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  contractCreateSchema,
  contractUpdateSchema,
} from "@/pages/contract/lib/contract.schema";

type ContractFormValues = z.output<typeof contractCreateSchema>;

interface UseContractFormProps {
  defaultValues: Partial<ContractFormValues>;
  mode?: "create" | "update";
}

// Definir el tipo específico para los productos_modulos
interface ProductoModuloField {
  id: string;
  producto_id: number;
  modulo_id: number;
  precio: number;
}

// Definir el tipo específico para las cuotas
interface CuotaField {
  id: string;
  monto: number;
  fecha_vencimiento: string;
}

export const useContractForm = ({
  defaultValues,
  mode = "create",
}: UseContractFormProps) => {
  const runtimeSchema =
    mode === "create" ? contractCreateSchema : contractUpdateSchema;

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(runtimeSchema),
    defaultValues: {
      fecha_inicio: "",
      fecha_fin: "",
      numero: "",
      cliente_id: undefined as unknown as number,
      tipo_contrato: "saas",
      total: 0,
      forma_pago: "unico",
      productos_modulos: [],
      cuotas: [],
      ...defaultValues,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { isValid },
  } = form;

  // Field Arrays con tipado específico
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productos_modulos",
  });

  const {
    fields: cuotaFields,
    append: appendCuota,
    remove: removeCuota,
    replace: replaceCuotas,
  } = useFieldArray({
    control,
    name: "cuotas",
  });

  // State
  const [open, setOpen] = useState(false);
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(1);
  const [manualSum, setManualSum] = useState<number>(0);

  // Watch values
  const productos = watch("productos_modulos");
  const paymentMethod = watch("forma_pago");
  const total = watch("total");
  const fechaInicio = watch("fecha_inicio");
  const fechaFin = watch("fecha_fin");

  // Calculate sum
  const sum = useMemo(() => {
    const currentValues = form.getValues("productos_modulos") || [];
    const total = currentValues.reduce((acc, x) => {
      const precio = Number(x?.precio) || 0;
      return acc + precio;
    }, 0);
    return total;
  }, [productos, form]);

  // Manual sum recalculation
  const recalculateSum = () => {
    const currentValues = form.getValues("productos_modulos") || [];
    const newSum = currentValues.reduce((acc, x) => {
      const precio = Number(x?.precio) || 0;
      return acc + precio;
    }, 0);
    setManualSum(newSum);
    return newSum;
  };

  // Calculate installments sum and check balance
  const currentInstallmentsSum = cuotaFields.reduce(
    (acc, cuota) => acc + (Number((cuota as any).monto) || 0),
    0
  );

  const isInstallmentsUnbalanced =
    paymentMethod === "parcial" &&
    cuotaFields.length > 0 &&
    total > 0 &&
    Math.abs(currentInstallmentsSum - total) > 0.01;

  // Adjust existing installments
  const adjustExistingInstallments = () => {
    if (cuotaFields.length === 0 || !total) return;

    const installmentAmount =
      Math.round((total / cuotaFields.length) * 100) / 100;
    const lastInstallmentAmount =
      Math.round((total - installmentAmount * (cuotaFields.length - 1)) * 100) /
      100;

    const updatedCuotas = cuotaFields.map((cuota, index) => ({
      monto:
        index === cuotaFields.length - 1
          ? lastInstallmentAmount
          : installmentAmount,
      fecha_vencimiento: (cuota as any).fecha_vencimiento,
    }));

    replaceCuotas(updatedCuotas);
    setTimeout(() => form.trigger("cuotas"), 0);
  };

  // Generate installments
  const generateInstallments = () => {
    if (
      !numberOfInstallments ||
      numberOfInstallments < 1 ||
      !total ||
      !fechaInicio
    ) {
      return;
    }

    const installmentAmount =
      Math.round((total / numberOfInstallments) * 100) / 100;
    const lastInstallmentAmount =
      Math.round(
        (total - installmentAmount * (numberOfInstallments - 1)) * 100
      ) / 100;

    const startDate = new Date(fechaInicio);
    const newCuotas = [];

    for (let i = 0; i < numberOfInstallments; i++) {
      let dueDate: Date;

      if (i === numberOfInstallments - 1 && fechaFin) {
        dueDate = new Date(fechaFin);
      } else {
        dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
      }

      newCuotas.push({
        monto:
          i === numberOfInstallments - 1
            ? lastInstallmentAmount
            : installmentAmount,
        fecha_vencimiento: dueDate.toISOString().split("T")[0],
      });
    }

    replaceCuotas(newCuotas);
    setTimeout(() => form.trigger("cuotas"), 0);
  };

  // Effects
  useEffect(() => {
    mode === "update" && form.trigger();
  }, [form, mode]);

  useEffect(() => {
    mode === "update" && form.trigger("cuotas");
  }, [form, mode]);

  useEffect(() => {
    const finalSum = manualSum || sum;
    setValue("total", Math.round(finalSum * 100) / 100, {
      shouldValidate: true,
    });
  }, [sum, manualSum, setValue]);

  return {
    // Form
    form,
    control,
    handleSubmit,
    isValid,

    // Products - casting explícito para las props
    fields: fields as (ProductoModuloField & { id: string })[],
    append,
    remove,
    open,
    setOpen,

    // Calculations
    sum,
    manualSum,
    recalculateSum,

    // Installments - casting explícito para las props
    cuotaFields: cuotaFields as (CuotaField & { id: string })[],
    appendCuota,
    removeCuota,
    replaceCuotas,
    numberOfInstallments,
    setNumberOfInstallments,
    generateInstallments,
    adjustExistingInstallments,
    currentInstallmentsSum,
    isInstallmentsUnbalanced,

    // Watch values
    paymentMethod,
    total,
    fechaInicio,
    fechaFin,
  };
};
