import { useCallback, useEffect, useMemo, useState } from "react";
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
  const recalculateSum = useCallback(() => {
    const currentValues = form.getValues("productos_modulos") || [];
    const newSum = currentValues.reduce((acc, x) => {
      const precio = Number(x?.precio) || 0;
      return acc + precio;
    }, 0);
    setManualSum(newSum);
    return newSum;
  }, [form]);

  // Calculate installments sum and check balance
 const currentInstallmentsSum = watch("cuotas")?.reduce(
  (acc, cuota) => acc + (Number(cuota.monto) || 0),
  0
);

  console.log(currentInstallmentsSum);
  

  const isInstallmentsUnbalanced =
    paymentMethod === "parcial" &&
    cuotaFields.length > 0 &&
    total > 0 &&
    Math.abs((currentInstallmentsSum || 0) - total) > 0.01;

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
      !fechaInicio ||
      !fechaFin
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
    const endDate = new Date(fechaFin);
    const newCuotas = [];

    // Calcular la diferencia en días entre fecha inicio y fin
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Si solo hay una cuota, usar la fecha fin
    if (numberOfInstallments === 1) {
      newCuotas.push({
        monto: total,
        fecha_vencimiento: fechaFin,
      });
    } else if (totalDays <= 0) {
      // Si las fechas son iguales o inválidas, todas las cuotas van a fecha fin
      for (let i = 0; i < numberOfInstallments; i++) {
        newCuotas.push({
          monto:
            i === numberOfInstallments - 1
              ? lastInstallmentAmount
              : installmentAmount,
          fecha_vencimiento: fechaFin,
        });
      }
    } else if (numberOfInstallments <= totalDays + 1) {
      // Caso normal: hay suficientes días para distribuir
      for (let i = 0; i < numberOfInstallments; i++) {
        let dueDate: Date;

        if (i === numberOfInstallments - 1) {
          // La última cuota siempre debe ser la fecha fin
          dueDate = new Date(endDate);
        } else {
          // Distribuir proporcionalmente
          const daysFromStart = Math.floor(
            (totalDays / (numberOfInstallments - 1)) * i
          );
          dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + daysFromStart);
        }

        newCuotas.push({
          monto:
            i === numberOfInstallments - 1
              ? lastInstallmentAmount
              : installmentAmount,
          fecha_vencimiento: dueDate.toISOString().split("T")[0],
        });
      }
    } else {
      // Caso extremo: más cuotas que días disponibles
      // Distribuir las cuotas entre los días disponibles, agrupando cuando sea necesario

      const fechasDisponibles = [];
      for (let day = 0; day <= totalDays; day++) {
        const fecha = new Date(startDate);
        fecha.setDate(fecha.getDate() + day);
        fechasDisponibles.push(fecha.toISOString().split("T")[0]);
      }

      // Distribuir cuotas entre las fechas disponibles
      const cuotasPorFecha = Math.floor(
        numberOfInstallments / fechasDisponibles.length
      );
      const cuotasExtra = numberOfInstallments % fechasDisponibles.length;

      let cuotaIndex = 0;
      for (let fechaIdx = 0; fechaIdx < fechasDisponibles.length; fechaIdx++) {
        const cuotasEnEstaFecha =
          cuotasPorFecha + (fechaIdx < cuotasExtra ? 1 : 0);

        for (let c = 0; c < cuotasEnEstaFecha; c++) {
          const esUltimaCuota = cuotaIndex === numberOfInstallments - 1;
          newCuotas.push({
            monto: esUltimaCuota ? lastInstallmentAmount : installmentAmount,
            fecha_vencimiento: esUltimaCuota
              ? fechaFin
              : fechasDisponibles[fechaIdx],
          });
          cuotaIndex++;
        }
      }
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


  useEffect(() => {
    if (mode === "update") {
      setNumberOfInstallments(cuotaFields.length || 1);
    }
  }, [mode]);

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
