"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
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
import { Loader, Trash } from "lucide-react";
import {
  contractCreateSchema,
  contractUpdateSchema,
} from "@/pages/contract/lib/contract.schema"; // <- sin ".ts"
import { Label } from "@/components/ui/label";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { useAllClients } from "@/pages/client/lib/client.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { FormSelect } from "@/components/FormSelect";
import { Textarea } from "@/components/ui/textarea";

// 1) Tipo fuerte del formulario = OUTPUT del schema de create
type ContractFormValues = z.output<typeof contractCreateSchema>;

interface ContractFormProps {
  defaultValues: Partial<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ContractForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ContractFormProps) => {
  // 2) Schema de runtime tipado para el resolver como ZodType<ContractFormValues>
  const runtimeSchema =
    mode === "create" ? contractCreateSchema : contractUpdateSchema;

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(runtimeSchema),
    defaultValues: {
      fecha_inicio: "",
      fecha_fin: "",
      numero: "",
      cliente_id: undefined as unknown as number,
      total: 0,
      ...defaultValues,
    },
    mode: "onChange",
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
    
  });

  const [open, setOpen] = useState(false);

  const notificationData = useAllNotifications();

  const { data: clients, isLoading } = useAllClients();

  // 3) total = suma(precio)
  const notificationos = watch("notificationos_modulos");
  const sum = useMemo(
    () =>
      (notificationos ?? []).reduce(
        (acc, x) => acc + (Number(x?.precio) || 0),
        0
      ),
    [notificationos]
  );

  useEffect(() => {
    setValue("total", Math.round(sum * 100) / 100, { shouldValidate: true });
  }, [sum, setValue]);

  if (isLoading || !clients) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 bg-modal p-4 rounded-lg">
            <Label className="font-semibold mb-2 col-span-3">Cliente</Label>
            <FormField
              control={control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="CT-2025-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DatePickerFormField
              control={control}
              name="fecha_inicio"
              captionLayout="label"
              dateFormat="dd/MM/yyyy"
              label="Fecha Inicio"
              placeholder="Selecciona una fecha"
            />

            <DatePickerFormField
              control={control}
              name="fecha_fin"
              captionLayout="label"
              dateFormat="dd/MM/yyyy"
              label="Fecha Fin"
              placeholder="Selecciona una fecha"
            />

            <FormSelect
              control={control}
              label="Cliente"
              name="cliente_id"
              placeholder="Selecciona un cliente"
              options={clients.map((client) => ({
                label: client.razon_social,
                value: client.id.toString(),
              }))}
            />

            <FormSelect
              control={control}
              label="Tipo de contrato"
              name="tipo_contrato"
              placeholder="Selecciona un tipo"
              options={[
                {
                  label: "Desarrollo a Medida",
                  value: "Desarrollo a Medida",
                },
                {
                  label: "SaaS",
                  value: "saas",
                },
              ]}
            />
          </div>

          <div className="flex flex-col bg-modal p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold mb-2 col-span-3">
                Lista de Notificationos
              </Label>
              <Button type="button" onClick={() => setOpen(!open)}>
                Agregar
              </Button>
              <ContractModuleForm
                open={open}
                onAssign={append}
                control={control}
                notifications={notificationData.data || []}
                onOpenChange={() => setOpen(!open)}
              />
            </div>

            <div className="w-fit mx-auto">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay items. Agrega al menos uno.
                </p>
              )}

              {fields.length > 0 && (
                <div className="grid grid-cols-12 items-center gap-2 mb-2 font-semibold text-sm text-muted-foreground">
                  <span className="col-span-1"></span>
                  <span className="col-span-3">Notificationo</span>
                  <span className="col-span-4">Módulo ID</span>
                  <span className="col-span-3">Precio</span>
                  <span className="col-span-1"></span>
                </div>
              )}

              {fields.map((row, index) => (
                <div
                  key={row.id ?? index}
                  className="grid grid-cols-12 items-center gap-2 mb-2"
                >
                  <span className="col-span-1 text-sm text-muted-foreground">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>

                  <div className="col-span-3">
                    <Label>
                      {
                        notificationData.data?.find(
                          (p) => p.id === row.notificationo_id
                        )?.nombre
                      }
                    </Label>
                  </div>

                  <div className="col-span-4">
                    <Label>
                      {
                        notificationData.data
                          ?.find((p) => p.id === row.notificationo_id)
                          ?.modulos.find((m) => m.id === row.modulo_id)?.nombre
                      }
                    </Label>
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={control}
                      name={`notificationos_modulos.${index}.precio`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="precio"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {fields.length > 0 && (
                <div className="mt-3 text-right text-sm text-muted-foreground">
                  Subtotal módulos: {sum.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-modal p-4 rounded-lg">
            <FormSelect
              control={control}
              label="Forma de pago"
              name="forma_pago"
              placeholder="Selecciona una forma de pago"
              options={[
                { label: "Parcial", value: "parcial" },
                { label: "Total", value: "total" },
              ]}
            />

            <FormField
              control={control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Total</FormLabel>
                  <FormControl>
                    <Input type="number" value={field.value ?? 0} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="col-span-2">
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting || !isValid}>
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
