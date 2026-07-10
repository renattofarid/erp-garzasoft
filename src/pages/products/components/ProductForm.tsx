"use client";

import type { ReactNode } from "react";
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
import { ProductType } from "../lib/product.interface";

interface ProductFormProps {
  defaultValues: Partial<ProductSchema>;
  onSubmit: (data: ProductSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

const RequiredMark = () => <span className="ml-1 text-red-500">*</span>;

const RequiredLabel = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <RequiredMark />
  </>
);

const conceptLabel = (tipo?: ProductType) =>
  tipo === "producto" ? "Conceptos de producto" : "Conceptos de servicio";

export const ProductForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ProductFormProps) => {
  const form = useForm<ProductSchema>({
    resolver: zodResolver(
      mode === "create" ? productSchemaCreate : productSchemaUpdate
    ),
    defaultValues: {
      nombre: "",
      tipo: "servicio",
      descripcion: "",
      modulos: [{ nombre: "", precio_unitario: 0 }],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const tipo = form.watch("tipo");

  const {
    fields: conceptos,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "modulos",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 col-span-12 bg-modal p-4 rounded-lg space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>Tipo</RequiredLabel>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      <option value="servicio">Servicio</option>
                      <option value="producto">Producto</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>Nombre</RequiredLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del servicio o producto" {...field} />
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
                    <Input placeholder="Descripción opcional" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-8 col-span-12 bg-modal p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{conceptLabel(tipo)}</h3>
              <Button
                type="button"
                size="icon"
                onClick={() => append({ nombre: "", precio_unitario: 0 })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {conceptos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay conceptos añadidos.
              </p>
            )}

            {conceptos.length > 0 && (
              <div className="grid grid-cols-12 items-center gap-2 mb-2 font-semibold text-sm text-muted-foreground">
                <span className="col-span-1"></span>
                <span className="col-span-6">Nombre del concepto</span>
                <span className="col-span-4">Precio</span>
                <span className="col-span-1"></span>
              </div>
            )}

            {conceptos.map((concepto, index) => (
              <div
                key={concepto.id || index}
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
                          <Input placeholder="Nombre del concepto" {...field} />
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
