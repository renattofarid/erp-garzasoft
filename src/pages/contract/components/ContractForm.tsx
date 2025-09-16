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
import ContractModuleForm from "./ContractModuleForm";
import { useAllProducts } from "@/pages/products/lib/product.hook";
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productos_modulos",
  });

  useEffect(() => {
    mode === "update" && form.trigger(); // fuerza validación inicial con los defaultValues ya seteados
  }, []);

  const [open, setOpen] = useState(false);
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(1);
  const [manualSum, setManualSum] = useState<number>(0);

  // Función para recalcular el sum manualmente
  const recalculateSum = () => {
    const currentValues = form.getValues("productos_modulos") || [];
    const newSum = currentValues.reduce((acc, x) => {
      const precio = Number(x?.precio) || 0;
      return acc + precio;
    }, 0);
    setManualSum(newSum);
    return newSum;
  };

  const productData = useAllProducts();

  const { data: clients, isLoading } = useAllClients();

  // 3) total = suma(precio)
  const productos = watch("productos_modulos");
  const paymentMethod = watch("forma_pago");
  const total = watch("total");
  const fechaInicio = watch("fecha_inicio");
  const fechaFin = watch("fecha_fin");

  const sum = useMemo(() => {
    const currentValues = form.getValues("productos_modulos") || [];
    const total = currentValues.reduce((acc, x) => {
      const precio = Number(x?.precio) || 0;
      return acc + precio;
    }, 0);
    console.log("Productos desde getValues:", currentValues);
    console.log("Sum calculado:", total);
    return total;
  }, [productos, form]);

  const {
    fields: cuotaFields,
    append: appendCuota,
    remove: removeCuota,
    replace: replaceCuotas,
  } = useFieldArray({
    control,
    name: "cuotas",
  });

  useEffect(() => {
    mode === "update" && form.trigger("cuotas");
  }, []);

  useEffect(() => {
    const finalSum = manualSum || sum;
    setValue("total", Math.round(finalSum * 100) / 100, {
      shouldValidate: true,
    });
  }, [sum, manualSum, setValue]);

  // Función para ajustar cuotas existentes al nuevo total
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

  // Verificar si las cuotas están desbalanceadas
  const currentInstallmentsSum = cuotaFields.reduce(
    (acc, cuota) => acc + (Number(cuota.monto) || 0),
    0
  );
  const isInstallmentsUnbalanced =
    paymentMethod === "parcial" &&
    cuotaFields.length > 0 &&
    total > 0 &&
    Math.abs(currentInstallmentsSum - total) > 0.01;
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
    const fechaFin = watch("fecha_fin");
    const newCuotas = [];

    for (let i = 0; i < numberOfInstallments; i++) {
      let dueDate: Date;

      if (i === numberOfInstallments - 1 && fechaFin) {
        // La última cuota debe coincidir con la fecha fin del contrato
        dueDate = new Date(fechaFin);
      } else {
        // Las demás cuotas se distribuyen mensualmente desde la fecha de inicio
        dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
      }

      newCuotas.push({
        monto:
          i === numberOfInstallments - 1
            ? lastInstallmentAmount
            : installmentAmount,
        fecha_vencimiento: dueDate.toISOString().split("T")[0], // formato YYYY-MM-DD
      });
    }

    replaceCuotas(newCuotas);
    setTimeout(() => form.trigger("cuotas"), 0);
  };

  if (isLoading || !clients) return <FormSkeleton />;
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col gap-4">
          <Label className="font-semibold md:col-span-3 text-xl">
            Cliente
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-modal p-4 rounded-lg">
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
              captionLayout="dropdown"
              dateFormat="dd/MM/yyyy"
              label="Fecha Inicio"
              placeholder="Selecciona una fecha"
            />

            <DatePickerFormField
              control={control}
              name="fecha_fin"
              captionLayout="dropdown"
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
                  value: "desarrollo",
                },
                {
                  label: "SaaS",
                  value: "saas",
                },
                {
                  label: "Soporte",
                  value: "soporte",
                },
              ]}
            />
          </div>

          <div className="flex flex-col bg-modal p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold mb-2 col-span-3">
                Lista de Productos
              </Label>
              <Button type="button" onClick={() => setOpen(!open)}>
                Agregar
              </Button>
              <ContractModuleForm
                open={open}
                onAssign={append}
                control={control}
                products={productData.data || []}
                onOpenChange={() => setOpen(!open)}
              />
            </div>

            <div className="w-fit mx-auto overflow-x-auto">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay items. Agrega al menos uno.
                </p>
              )}

              {fields.length > 0 && (
                <div className="grid grid-cols-12 items-center gap-2 mb-2 font-semibold text-sm text-muted-foreground">
                  <span className="col-span-1 hidden md:block"></span>
                  <span className="col-span-3">Producto</span>
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
                  <span className="col-span-1 text-sm text-muted-foreground hidden md:block">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>

                  <div className="col-span-3">
                    <Label>
                      {
                        productData.data?.find((p) => p.id === row.producto_id)
                          ?.nombre
                      }
                    </Label>
                  </div>

                  <div className="col-span-4">
                    <Label>
                      {
                        productData.data
                          ?.find((p) => p.id === row.producto_id)
                          ?.modulos.find((m) => m.id === row.modulo_id)?.nombre
                      }
                    </Label>
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={control}
                      name={`productos_modulos.${index}.precio`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="precio"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const newValue =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                console.log(
                                  "Precio cambiado:",
                                  newValue,
                                  "en index:",
                                  index
                                );
                                field.onChange(newValue);
                                // Recalcular sum manualmente
                                setTimeout(() => {
                                  recalculateSum();
                                }, 0);
                              }}
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
                  Subtotal módulos: {(manualSum || sum).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-3 bg-modal p-4 rounded-lg">
            <FormSelect
              control={control}
              label="Forma de pago"
              name="forma_pago"
              placeholder="Selecciona una forma de pago"
              options={[
                { label: "Parcial", value: "parcial" },
                { label: "Único", value: "unico" },
              ]}
              onChange={() => {
                form.trigger("cuotas");
              }}
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

            <div className="col-span-2">
              {paymentMethod === "parcial" && (
                <div className="flex flex-col bg-modal p-4 rounded-lg">
                  {/* Alerta de desbalance */}
                  {isInstallmentsUnbalanced && (
                    <div className="mb-4 p-3 bg-background shadow rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-primary-foreground">
                              !
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">
                              Las cuotas no coinciden con el total
                            </p>
                            <p className="text-xs text-secondary">
                              <strong>Total: S/.{total.toFixed(2)}</strong> |
                              Suma cuotas: S/.
                              {currentInstallmentsSum.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={adjustExistingInstallments}
                        >
                          Ajustar cuotas
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-semibold">Cuotas</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Número de cuotas:</Label>
                        <Input
                          type="number"
                          min="1"
                          max="48"
                          value={numberOfInstallments}
                          onChange={(e) =>
                            setNumberOfInstallments(Number(e.target.value))
                          }
                          className="w-20"
                          placeholder="1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={generateInstallments}
                          disabled={
                            !total ||
                            !fechaInicio ||
                            !fechaFin ||
                            numberOfInstallments < 1
                          }
                          title={
                            !total || !fechaInicio || !fechaFin
                              ? "Necesitas completar: total, fecha inicio y fecha fin"
                              : numberOfInstallments < 1
                              ? "El número de cuotas debe ser mayor a 0"
                              : "Generar cuotas automáticamente"
                          }
                        >
                          Generar
                        </Button>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          appendCuota({ monto: 0, fecha_vencimiento: "" })
                        }
                      >
                        Agregar cuota manual
                      </Button>
                    </div>
                  </div>

                  {cuotaFields.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay cuotas. Agrega al menos una o genera
                      automáticamente.
                    </p>
                  )}

                  {cuotaFields.length > 0 && (
                    <div className="space-y-3 mx-auto gap-4">
                      <div className="grid grid-cols-12 items-center gap-2 mb-2 font-semibold text-sm text-muted-foreground">
                        <span className="col-span-1">#</span>
                        <span className="col-span-5">Monto</span>
                        <span className="col-span-5">Fecha Vencimiento</span>
                        <span className="col-span-1"></span>
                      </div>
                      {cuotaFields.map((row, index) => (
                        <div key={row.id} className="space-y-1">
                          <div
                            key={row.id}
                            className="grid grid-cols-12 items-end gap-2"
                          >
                            <div className="col-span-1 text-sm text-muted-foreground">
                              {index + 1}
                            </div>

                            <div className="col-span-5">
                              <FormField
                                control={control}
                                name={`cuotas.${index}.monto`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Monto"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                          field.onChange(
                                            e.target.value === ""
                                              ? undefined
                                              : Number(e.target.value)
                                          );
                                          form.trigger("cuotas");
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="col-span-5">
                              <DatePickerFormField
                                control={control}
                                name={`cuotas.${index}.fecha_vencimiento`}
                                captionLayout="dropdown"
                                dateFormat="dd/MM/yyyy"
                                placeholder="Selecciona una fecha"
                                onChange={() => {
                                  form.trigger("cuotas");
                                }}
                              />
                            </div>

                            <div className="col-span-1 text-right">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => removeCuota(index)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {cuotaFields.length > 0 && (
                        <div className="mt-3 text-right text-sm">
                          <span className="text-muted-foreground">
                            Total cuotas:{" "}
                            {cuotaFields
                              .reduce(
                                (acc, cuota) =>
                                  acc + (Number(cuota.monto) || 0),
                                0
                              )
                              .toFixed(2)}
                          </span>
                          {Math.abs(
                            total -
                              cuotaFields.reduce(
                                (acc, cuota) =>
                                  acc + (Number(cuota.monto) || 0),
                                0
                              )
                          ) > 0.01 && (
                            <span className="ml-2 text-red-500">
                              (Diferencia:{" "}
                              {(
                                total -
                                cuotaFields.reduce(
                                  (acc, cuota) =>
                                    acc + (Number(cuota.monto) || 0),
                                  0
                                )
                              ).toFixed(2)}
                              )
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex w-full justify-center">
                <FormField
                  control={control}
                  name="cuotas"
                  render={() => <FormMessage />}
                />
              </div>
            </div>

            <FormItem className="col-span-2">
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </div>

        <pre>
          <code className="text-xs text-muted-foreground">
            {/* {JSON.stringify(form.getValues(), null, 2)} */}
            {/* {JSON.stringify(form.formState.isValid, null, 2)} */}
            {/* {JSON.stringify(form.formState.errors, null, 2)} */}
          </code>
        </pre>

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
