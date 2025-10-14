"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  CuentasPorCobrarSchema,
  cuentasPorCobrarSchemaCreate,
  cuentasPorCobrarSchemaUpdate,
} from "../lib/accounts-receivable.schema";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelect } from "@/components/FormSelect";
import { useAllContracts } from "@/pages/contract/lib/contract.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { format, parse } from "date-fns";

interface CuentasPorCobrarFormProps {
  defaultValues: Partial<CuentasPorCobrarSchema>;
  onSubmit: (data: CuentasPorCobrarSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const CuentasPorCobrarForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CuentasPorCobrarFormProps) => {
  const { data: contracts, isLoading } = useAllContracts();

  const form = useForm<CuentasPorCobrarSchema>({
    resolver: zodResolver(
      mode === "create"
        ? cuentasPorCobrarSchemaCreate
        : cuentasPorCobrarSchemaUpdate
    ),
    defaultValues: {
      contrato_id: 0,
      monto: 0,
      fecha_vencimiento: "",
      fecha_pago: null,
      situacion: "pendiente",
      ...defaultValues,
    },
    mode: "onChange",
  });

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-modal rounded-lg">
          <FormSelect
            control={form.control}
            name="contrato_id"
            label="Contrato"
            placeholder="Selecciona un contrato"
            options={
              contracts?.map((contract) => ({
                label: `${contract.numero} - ${
                  contract.cliente?.razon_social || "Sin cliente"
                }`,
                value: contract.id,
              })) || []
            }
          />

          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DatePickerFormField
            control={form.control}
            name="fecha_vencimiento"
            label="Fecha de Vencimiento"
            placeholder="Selecciona una fecha"
            captionLayout="dropdown"
            dateFormat="dd/MM/yyyy"
          />

          <DatePickerFormField
            control={form.control}
            name="fecha_pago"
            label="Fecha de Pago"
            placeholder="Selecciona una fecha (opcional)"
            captionLayout="dropdown"
            dateFormat="dd/MM/yyyy"
          />

          <FormSelect
            control={form.control}
            name="situacion"
            label="Situación"
            placeholder="Selecciona la situación"
            options={[
              { label: "Pendiente", value: "pendiente" },
              { label: "Pagado", value: "pagado" },
              { label: "Vencido", value: "vencido" },
            ]}
          />
        </div>

      {defaultValues.pagos_cuota &&
  defaultValues.pagos_cuota.length > 0 &&
  mode === "update" && (
    <div className="p-6 bg-modal rounded-xl shadow-lg border">
      <h3 className="font-semibold text-lg text-primary mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Cuotas pagadas
      </h3>
      {/* SCROLL AGREGADO AQUÍ */}
      <ul className="space-y-4 overflow-y-auto max-h-[290px] pr-2">
        {defaultValues.pagos_cuota.map((pago) => (
          <li
            key={pago.id}
            className="flex items-center justify-between bg-modal rounded-md px-4 py-3 border border-gray-200"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Monto pagado:{" "}
                <b className="ml-1">S/.{pago.monto_pagado}</b>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Fecha de pago:{" "}
                <b className="ml-1">
                  {pago.fecha_pago
                    ? format(
                        parse(
                          pago.fecha_pago.split("T").shift() || "",
                          "yyyy-MM-dd",
                          new Date()
                        ),
                        "dd/MM/yyyy"
                      )
                    : "Sin fecha"}
                </b>
              </span>
            </div>
            {pago.comprobante && (
              <a
                href={pago.comprobante}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline ml-4"
              >
                Ver comprobante
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )}

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          {defaultValues.situacion === "pagado" && mode === "update" ? (
            <>
              <Button type="button" disabled>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Completado
              </Button>
            </>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
              />
              {isSubmitting ? "Guardando" : "Guardar"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
