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
import {
  ClientSchema,
  clientSchemaCreate,
  clientSchemaUpdate,
} from "../lib/client.schema.ts";
import { Loader, Plus, Trash } from "lucide-react";
import { FormSelect } from "@/components/FormSelect.tsx";
import { Label } from "@/components/ui/label.tsx";

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
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-sidebar rounded-lg">
          <Label className="font-semibold mb-2 col-span-3">
            Información básica del cliente
          </Label>

          <FormSelect
            control={form.control}
            name="tipo"
            label="Tipo de Cliente"
            placeholder="Selecciona el tipo"
            options={[
              { value: "corporacion", label: "Corporación" },
              { value: "persona natural", label: "Persona Natural" },
            ]}
          />

          <FormField
            control={form.control}
            name="ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC</FormLabel>
                <FormControl>
                  <Input
                    maxLength={11}
                    placeholder="Ej: 20548465321"
                    {...field}
                  />
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
                  <Input placeholder="Ej: Corporacion ABC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className=" gap-4 p-4 bg-sidebar rounded-lg">
          <Label className="font-semibold mb-2 col-span-3">Sucursales</Label>

          <FormField
            control={form.control}
            name="sucursales"
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {field.value?.map((item, index) => (
                  <FormItem
                    key={index}
                    className="flex flex-col md:flex-row items-start gap-2"
                  >
                    <div className="w-full flex-1">
                      <FormControl>
                        <Input
                          placeholder="Ej: Sucursal Principal"
                          value={item.nombre}
                          onChange={(e) => {
                            const newValue = [...(field.value || [])];
                            newValue[index] = { nombre: e.target.value };
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>

                    {field.value !== undefined &&
                      field.value.length === index + 1 && (
                        <>
                          {field.value.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              onClick={() => {
                                if (!field.value) return;
                                const newValue = field.value.filter(
                                  (_, i) => i !== index
                                );
                                field.onChange(newValue);
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
                            }}
                            className="col-span-1 md:col-span-2 xl:col-span-3"
                            size="icon"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                  </FormItem>
                ))}
              </div>
            )}
          />
        </div>

        {/* <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
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
