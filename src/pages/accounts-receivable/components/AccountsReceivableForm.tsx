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
                label: `${contract.numero} - ${contract.cliente.razon_social}`,
                value: contract.id.toString(),
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

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
