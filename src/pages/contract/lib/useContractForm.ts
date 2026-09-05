import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  addMonths,
  addYears,
  format,
  lastDayOfMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  calculateMonthsBetween,
  contractCreateSchema,
  contractUpdateSchema,
} from "@/pages/contract/lib/contract.schema";
import { getNextContractNumber } from "./contract.actions";

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
      forma_pago: "parcial",
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
  const [dueDayType, setDueDayType] = useState<"fin_mes" | "inicio_mes">("fin_mes");
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

  const costoInstalacion = watch("costo_instalacion");

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
    const months = calculateMonthsBetween(fechaInicio, fechaFin);
    if (paymentPeriodicity === "anual") {
      return Math.max(1, Math.round(months / 12));
    }
    return Math.max(1, months);
  }, [fechaInicio, fechaFin, paymentPeriodicity]);

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

    for (let index = 0; index < installmentCount; index++) {
      let targetMonthDate: Date;
      if (paymentPeriodicity === "anual") {
        targetMonthDate = addYears(startDate, index);
      } else {
        targetMonthDate = addMonths(startDate, index);
      }

      let nextDate: Date;
      if (dueDayType === "inicio_mes") {
        nextDate = startOfMonth(targetMonthDate);
      } else {
        nextDate = lastDayOfMonth(targetMonthDate);
      }

      const finalDate = nextDate > endDate ? endDate : nextDate;
      dates.push(format(finalDate, "yyyy-MM-dd"));
    }

    return dates;
  }, [
    dueDayType,
    fechaFin,
    fechaInicio,
    numberOfInstallments,
    paymentPeriodicity,
  ]);

  const adjustExistingInstallments = () => {
    if (cuotaFields.length === 0 || !total) return;

    const count = cuotaFields.length;
    const instalacion =
      paymentPeriodicity === "mensual"
        ? Number(costoInstalacion ?? 0)
        : 0;

    if (dueDayType === "fin_mes" && instalacion > 0 && count > 1) {
      const baseTotal = Math.max(0, total - instalacion);
      const regularCount = count - 1;
      const baseInstallment = Math.round((baseTotal / regularCount) * 100) / 100;
      let cumulativeBase = 0;

      const updatedCuotas = cuotaFields.map((cuota, index) => {
        if (index === 0) {
          return {
            monto: Math.round(instalacion * 100) / 100,
            fecha_vencimiento: cuota.fecha_vencimiento,
          };
        }
        if (index === count - 1) {
          const lastAmount = Math.round((baseTotal - cumulativeBase) * 100) / 100;
          return {
            monto: lastAmount,
            fecha_vencimiento: cuota.fecha_vencimiento,
          };
        }
        cumulativeBase += baseInstallment;
        return {
          monto: baseInstallment,
          fecha_vencimiento: cuota.fecha_vencimiento,
        };
      });

      replaceCuotas(updatedCuotas);
    } else {
      const baseTotal = Math.max(0, total - instalacion);
      const baseInstallment = Math.round((baseTotal / count) * 100) / 100;
      let cumulativeSum = 0;

      const updatedCuotas = cuotaFields.map((cuota, index) => {
        if (index === 0) {
          const firstAmount =
            count === 1
              ? total
              : Math.round((baseInstallment + instalacion) * 100) / 100;
          cumulativeSum += firstAmount;
          return {
            monto: firstAmount,
            fecha_vencimiento: cuota.fecha_vencimiento,
          };
        }
        if (index === count - 1) {
          const lastAmount = Math.round((total - cumulativeSum) * 100) / 100;
          return {
            monto: lastAmount,
            fecha_vencimiento: cuota.fecha_vencimiento,
          };
        }
        cumulativeSum += baseInstallment;
        return {
          monto: baseInstallment,
          fecha_vencimiento: cuota.fecha_vencimiento,
        };
      });

      replaceCuotas(updatedCuotas);
    }

    setTimeout(() => form.trigger("cuotas"), 0);
  };

  const generateInstallments = () => {
    if (!total || !fechaInicio || !fechaFin) return;

    const startDate = parseISO(`${fechaInicio}T00:00:00`);
    const endDate = parseISO(`${fechaFin}T00:00:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return;
    }

    const count = Math.max(numberOfInstallments || 1, 1);
    const instalacion =
      paymentPeriodicity === "mensual"
        ? Number(costoInstalacion ?? 0)
        : 0;

    const newCuotas: { monto: number; fecha_vencimiento: string }[] = [];

    if (dueDayType === "fin_mes" && instalacion > 0) {
      const installationDate = startOfMonth(startDate);
      newCuotas.push({
        monto: Math.round(instalacion * 100) / 100,
        fecha_vencimiento: format(installationDate, "yyyy-MM-dd"),
      });

      const baseTotal = Math.max(0, total - instalacion);
      const baseInstallment = Math.round((baseTotal / count) * 100) / 100;
      let cumulativeBase = 0;

      for (let index = 0; index < count; index++) {
        const targetMonthDate =
          paymentPeriodicity === "anual"
            ? addYears(startDate, index)
            : addMonths(startDate, index);

        const nextDate = lastDayOfMonth(targetMonthDate);
        const finalDate = nextDate > endDate ? endDate : nextDate;

        let amount: number;
        if (index === count - 1) {
          amount = Math.round((baseTotal - cumulativeBase) * 100) / 100;
        } else {
          amount = baseInstallment;
          cumulativeBase += baseInstallment;
        }

        newCuotas.push({
          monto: amount,
          fecha_vencimiento: format(finalDate, "yyyy-MM-dd"),
        });
      }
    } else {
      const suggestedDates = getSuggestedInstallmentDates();
      if (suggestedDates.length === 0) return;

      const baseTotal = Math.max(0, total - instalacion);
      const baseInstallment = Math.round((baseTotal / count) * 100) / 100;
      let cumulativeSum = 0;

      suggestedDates.forEach((fecha, index) => {
        if (index === 0) {
          const firstAmount =
            count === 1
              ? total
              : Math.round((baseInstallment + instalacion) * 100) / 100;
          cumulativeSum += firstAmount;
          newCuotas.push({
            monto: firstAmount,
            fecha_vencimiento: fecha,
          });
        } else if (index === count - 1) {
          const lastAmount = Math.round((total - cumulativeSum) * 100) / 100;
          newCuotas.push({
            monto: lastAmount,
            fecha_vencimiento: fecha,
          });
        } else {
          cumulativeSum += baseInstallment;
          newCuotas.push({
            monto: baseInstallment,
            fecha_vencimiento: fecha,
          });
        }
      });
    }

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
    const instalacion =
      paymentPeriodicity === "mensual"
        ? Number(costoInstalacion ?? 0)
        : 0;
    const finalSum = baseSum * getBillingPeriods() + instalacion;
    setValue("total", Math.round(finalSum * 100) / 100, {
      shouldValidate: true,
    });
  }, [
    sum,
    manualSum,
    setValue,
    contractType,
    getBillingPeriods,
    paymentPeriodicity,
    costoInstalacion,
  ]);

  useEffect(() => {
    if (paymentPeriodicity === "mensual") {
      const current = form.getValues("costo_instalacion");
      if (current === undefined || current === null) {
        setValue("costo_instalacion", 100, { shouldValidate: true });
      }
    } else if (paymentPeriodicity === "anual") {
      setValue("costo_instalacion", 0, { shouldValidate: true });
    }
  }, [paymentPeriodicity, setValue, form]);

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

    const totalMonths =
      vigenciaContrato === "anual" ? (duracionAnios || 1) * 12 : 6;
    const targetMonthDate = addMonths(startDate, totalMonths - 1);
    const nextEndDate = lastDayOfMonth(targetMonthDate);

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

  const previousYearRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode !== "create" || !fechaInicio) return;

    try {
      const startDate = parseISO(`${fechaInicio}T00:00:00`);
      if (Number.isNaN(startDate.getTime())) return;
      const year = startDate.getFullYear();

      if (previousYearRef.current !== null && previousYearRef.current !== year) {
        const currentNumero = form.getValues("numero");
        if (!currentNumero || /^CT-\d{4}-\d+$/.test(currentNumero)) {
          getNextContractNumber(year)
            .then((newNumero) => {
              setValue("numero", newNumero, {
                shouldDirty: false,
                shouldValidate: true,
              });
            })
            .catch(() => {});
        }
      }
      previousYearRef.current = year;
    } catch {
      // ignore
    }
  }, [fechaInicio, form, mode, setValue]);

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
    dueDayType,
    setDueDayType,
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
