import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  addMonths,
  addYears,
  differenceInMonths,
  format,
  parseISO,
} from "date-fns";
import {
  contractCreateSchema,
  contractUpdateSchema,
} from "@/pages/contract/lib/contract.schema";

type ContractFormValues = z.output<typeof contractCreateSchema>;

interface UseContractFormProps {
  defaultValues: Partial<ContractFormValues>;
  mode?: "create" | "update";
}

interface ProductoModuloField {
  id: string;
  producto_id: number;
  modulo_id: number;
  precio: number;
}

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
      cliente_padre_id: undefined as unknown as number,
      cliente_id: undefined as unknown as number,
      tipo_contrato: "saas",
      vigencia_contrato: "anual",
      duracion_anios: 1,
      total: 0,
      forma_pago: "unico",
      periodicidad_cuota: "mensual",
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

  const [open, setOpen] = useState(false);
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(1);
  const [manualSum, setManualSum] = useState<number>(0);
  const [installmentsTouched, setInstallmentsTouched] = useState(false);
  const previousAutoDateState = useRef<{
    fechaInicio: string;
    vigenciaContrato: string;
    duracionAnios: number;
  }>({
    fechaInicio: "",
    vigenciaContrato: "",
    duracionAnios: 1,
  });

  const productos = watch("productos_modulos");
  const paymentMethod = watch("forma_pago");
  const contractType = watch("tipo_contrato");
  const vigenciaContrato = watch("vigencia_contrato");
  const duracionAnios = watch("duracion_anios");
  const paymentPeriodicity = watch("periodicidad_cuota");
  const total = watch("total");
  const fechaInicio = watch("fecha_inicio");
  const fechaFin = watch("fecha_fin");

  const sum = useMemo(() => {
    const currentValues = form.getValues("productos_modulos") || [];
    return currentValues.reduce((acc, item) => acc + (Number(item?.precio) || 0), 0);
  }, [productos, form]);

  const recalculateSum = useCallback(() => {
    const currentValues = form.getValues("productos_modulos") || [];
    const newSum = currentValues.reduce(
      (acc, item) => acc + (Number(item?.precio) || 0),
      0
    );
    setManualSum(newSum);
    return newSum;
  }, [form]);

  const currentInstallmentsSum = watch("cuotas")?.reduce(
    (acc, cuota) => acc + (Number(cuota.monto) || 0),
    0
  );

  const getBillingPeriods = useCallback(() => {
    if (paymentPeriodicity === "anual") {
      return vigenciaContrato === "anual" ? Math.max(duracionAnios || 1, 1) : 1;
    }

    if (vigenciaContrato === "anual") {
      return Math.max((duracionAnios || 1) * 12, 1);
    }

    return 6;
  }, [duracionAnios, paymentPeriodicity, vigenciaContrato]);

  const isInstallmentsUnbalanced =
    paymentMethod === "parcial" &&
    cuotaFields.length > 0 &&
    total > 0 &&
    Math.abs((currentInstallmentsSum || 0) - total) > 0.01;

  const getSuggestedInstallmentDates = useCallback(() => {
    if (!fechaInicio || !fechaFin) return [];

    const startDate = parseISO(`${fechaInicio}T00:00:00`);
    const endDate = parseISO(`${fechaFin}T00:00:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return [];
    }

    const dates: string[] = [];
    const installmentCount = Math.max(numberOfInstallments || 1, 1);
    const totalMonths = Math.max(differenceInMonths(endDate, startDate), 1);
    const intervalMonths =
      paymentPeriodicity === "anual"
        ? Math.max(
            1,
            vigenciaContrato === "anual"
              ? Math.max(Math.round((duracionAnios || 1) * 12 / installmentCount), 1)
              : Math.max(Math.round(6 / installmentCount), 1)
          )
        : Math.max(Math.round(totalMonths / installmentCount), 1);

    for (let index = 0; index < installmentCount; index++) {
      const nextDate = addMonths(startDate, intervalMonths * index);
      dates.push(format(nextDate > endDate ? endDate : nextDate, "yyyy-MM-dd"));
    }

    return dates;
  }, [
    duracionAnios,
    fechaFin,
    fechaInicio,
    numberOfInstallments,
    paymentPeriodicity,
    vigenciaContrato,
  ]);

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
      fecha_vencimiento: cuota.fecha_vencimiento,
    }));

    replaceCuotas(updatedCuotas);
    setTimeout(() => form.trigger("cuotas"), 0);
  };

  const generateInstallments = () => {
    const suggestedDates = getSuggestedInstallmentDates();

    if (!total || suggestedDates.length === 0) {
      return;
    }

    const suggestedInstallments = suggestedDates.length;
    const installmentAmount =
      Math.round((total / suggestedInstallments) * 100) / 100;
    const lastInstallmentAmount =
      Math.round(
        (total - installmentAmount * (suggestedInstallments - 1)) * 100
      ) / 100;

    const newCuotas = suggestedDates.map((fecha, index) => ({
      monto:
        index === suggestedInstallments - 1
          ? lastInstallmentAmount
          : installmentAmount,
      fecha_vencimiento: fecha,
    }));

    replaceCuotas(newCuotas);
    setTimeout(() => form.trigger("cuotas"), 0);
  };

  useEffect(() => {
    if (mode === "update") {
      form.trigger();
      form.trigger("cuotas");
    }
  }, [form, mode]);

  useEffect(() => {
    if (contractType !== "saas") return;

    const baseSum = manualSum || sum;
    const finalSum = baseSum * getBillingPeriods();
    setValue("total", Math.round(finalSum * 100) / 100, {
      shouldValidate: true,
    });
  }, [sum, manualSum, setValue, contractType, getBillingPeriods]);

  useEffect(() => {
    if (vigenciaContrato === "semestral" && paymentPeriodicity === "anual") {
      setValue("periodicidad_cuota", "mensual", { shouldValidate: true });
    }
  }, [vigenciaContrato, paymentPeriodicity, setValue]);

  useEffect(() => {
    if (!fechaInicio || !vigenciaContrato) return;

    const currentDuration = duracionAnios || 1;
    const shouldAutoUpdate =
      previousAutoDateState.current.fechaInicio !== fechaInicio ||
      previousAutoDateState.current.vigenciaContrato !== vigenciaContrato ||
      previousAutoDateState.current.duracionAnios !== currentDuration;

    previousAutoDateState.current = {
      fechaInicio,
      vigenciaContrato,
      duracionAnios: currentDuration,
    };

    if (!shouldAutoUpdate) return;

    const startDate = parseISO(`${fechaInicio}T00:00:00`);
    if (Number.isNaN(startDate.getTime())) return;

    const nextEndDate =
      vigenciaContrato === "anual"
        ? addYears(startDate, currentDuration)
        : addMonths(startDate, 6);

    const formattedEndDate = format(nextEndDate, "yyyy-MM-dd");

    if (fechaFin !== formattedEndDate) {
      setValue("fecha_fin", formattedEndDate, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [duracionAnios, fechaFin, fechaInicio, setValue, vigenciaContrato]);

  useEffect(() => {
    if (contractType === "saas") return;

    setValue("productos_modulos", [], { shouldValidate: true });
    setManualSum(0);
  }, [contractType, setValue]);

  useEffect(() => {
    if (installmentsTouched) return;
    setNumberOfInstallments(getBillingPeriods());
  }, [getBillingPeriods, installmentsTouched]);

  return {
    form,
    control,
    handleSubmit,
    isValid,

    fields: fields as (ProductoModuloField & { id: string })[],
    append,
    remove,
    open,
    setOpen,

    sum,
    manualSum,
    recalculateSum,

    cuotaFields: cuotaFields as (CuotaField & { id: string })[],
    appendCuota,
    removeCuota,
    replaceCuotas,
    numberOfInstallments,
    setNumberOfInstallments,
    setInstallmentsTouched,
    generateInstallments,
    adjustExistingInstallments,
    currentInstallmentsSum,
    isInstallmentsUnbalanced,

    paymentMethod,
    contractType,
    vigenciaContrato,
    duracionAnios,
    paymentPeriodicity,
    total,
    fechaInicio,
    fechaFin,
  };
};
