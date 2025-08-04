"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader, Plus, Trash } from "lucide-react";
import {
  productSchemaCreate,
  productSchemaUpdate,
  ProductSchema,
} from "../lib/product.schema";

interface ProductFormProps {
  defaultValues: Partial<ProductSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ProductForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ProductFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? productSchemaCreate : productSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const {
    fields: modulos,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "modulos",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-4">
          {/* Formulario del producto */}
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Lista de Módulos */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Lista de Módulos</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => append({ nombre: "", precio_unitario: 0 })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {modulos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay módulos añadidos.
              </p>
            )}

            {modulos.map((modulo, index) => (
              <div
                key={modulo.id || index}
                className="grid grid-cols-12 items-center gap-2 mb-2"
              >
                <span className="col-span-1 text-sm text-muted-foreground">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`modulos.${index}.nombre`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nombre del módulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name={`modulos.${index}.precio_unitario`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Precio"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
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
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
