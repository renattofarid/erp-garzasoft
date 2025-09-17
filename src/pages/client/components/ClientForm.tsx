"use client";

import { useFieldArray } from "react-hook-form";
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
import {
  ClientSchema,
  clientSchemaCreate,
  clientSchemaUpdate,
} from "../lib/client.schema.ts";
import { Loader, Plus, Trash } from "lucide-react";
import { FormSelect } from "@/components/FormSelect.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useEffect } from "react";

interface MetricFormProps {
  defaultValues: Partial<ClientSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ClientForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: MetricFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? clientSchemaCreate : clientSchemaUpdate
    ),
    defaultValues: {
      contactos: [{ nombre: "", celular: "", email: "" }],
      sucursales: [{ nombre: "" }],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactos",
  });

  useEffect(() => {
    if (mode === "update") {
      form.trigger();
    }
  }, [mode, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-sidebar rounded-lg">
          <Label className="font-semibold mb-2 md:col-span-2 xl:col-span-3">
            Información básica del cliente
          </Label>

          <FormSelect
            control={form.control}
            name="tipo"
            label="Tipo de Cliente"
            placeholder="Selecciona el tipo"
            options={[
              { value: "corporacion", label: "Corporación" },
              { value: "unico", label: "Único" },
            ]}
          />

          <FormField
            control={form.control}
            name="ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC</FormLabel>
                <FormControl>
                  <Input maxLength={11} placeholder="RUC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="razon_social"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social</FormLabel>
                <FormControl>
                  <Input placeholder="Razón Social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-4 p-4 bg-sidebar rounded-lg">
          <Label className="font-semibold mb-2 col-span-3">Sucursales</Label>

          <FormField
            control={form.control}
            name="sucursales"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {field.value?.map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row items-start gap-2"
                    >
                      <div className="w-full flex-1">
                        <FormField
                          control={form.control}
                          name={`sucursales.${index}.nombre`}
                          render={({ field: sucursalField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Sucursal"
                                  {...sucursalField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {field.value !== undefined &&
                        field.value.length === index + 1 && (
                          <>
                            {field.value.length > 1 && (
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  if (!field.value) return;
                                  const newValue = field.value.filter(
                                    (_, i) => i !== index
                                  );
                                  field.onChange(newValue);
                                  // Trigger validation after removing
                                  setTimeout(
                                    () => form.trigger("sucursales"),
                                    0
                                  );
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              onClick={() => {
                                const current =
                                  form.getValues("sucursales") || [];
                                form.setValue("sucursales", [
                                  ...current,
                                  { nombre: "" },
                                ]);
                                // Trigger validation after adding
                                setTimeout(() => form.trigger("sucursales"), 0);
                              }}
                              className="col-span-1 md:col-span-2 xl:col-span-3"
                              size="icon"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-sidebar rounded-lg">
          <Label className="font-semibold mb-2 md:col-span-2 xl:col-span-3">
            Datos del Dueño
          </Label>

          <FormField
            control={form.control}
            name="dueno_nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre y Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre Dueño" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueno_celular"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    maxLength={9}
                    placeholder="Teléfono Dueño"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueno_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="Dueño E-mail" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-sidebar rounded-lg">
          <Label className="font-semibold mb-2 md:col-span-2 xl:col-span-3">
            Datos del Representante
          </Label>

          <FormField
            control={form.control}
            name="representante_nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre y Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Representante Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="representante_celular"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    maxLength={9}
                    placeholder="Representante Teléfono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="representante_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="Representante E-mail" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-4 p-4 bg-sidebar rounded-lg">
          <div className="flex justify-between">
            <Label className="font-semibold mb-2 col-span-3">
              Datos del Responsable
            </Label>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                append({ nombre: "", celular: "", email: "" });
                // Trigger validation after adding
                setTimeout(() => form.trigger("contactos"), 0);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar responsable
            </Button>
          </div>

          <FormField
            control={form.control}
            name="contactos"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 gap-4">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
                    >
                      <FormField
                        control={form.control}
                        name={`contactos.${index}.nombre`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`contactos.${index}.celular`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                maxLength={9}
                                placeholder="Celular"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-2 w-full">
                        <FormField
                          control={form.control}
                          name={`contactos.${index}.email`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input placeholder="Email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              remove(index);
                              // Trigger validation after removing
                              setTimeout(() => form.trigger("contactos"), 0);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* 
        <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
            {JSON.stringify(form.formState.errors, null, 2)}
          </code>
        </pre> */}

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
