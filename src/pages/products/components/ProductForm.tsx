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
import { Loader, Palette, Plus, Trash, UploadCloud } from "lucide-react";
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
      modulos: [{ nombre: "", descripcion_contrato: "", precio_mensual: 0, precio_anual: 0 }],
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

            {/* Color y Logo Identificadores (Opcionales) */}
            <div className="space-y-3 pt-3 border-t border-border/80">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span>Personalización (Color y Logo)</span>
              </div>

              {/* Campo Color */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Color Identificador del Producto</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.value || "#0284c7"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-9 w-9 rounded border border-border cursor-pointer p-0.5 bg-background"
                            title="Seleccionar cualquier color de la gama"
                          />
                          <Input
                            type="text"
                            placeholder="#00a3cc o #eb5454 (Opcional)"
                            {...field}
                            value={field.value ?? ""}
                            className="h-9 text-xs font-mono"
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(null)}
                              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                              title="Quitar color (dejar nulo)"
                            >
                              Quitar
                            </Button>
                          )}
                        </div>

                        {/* Swatches de Paletas Variadas */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {[
                            { name: "Coral Gesrest", hex: "#eb5454" },
                            { name: "Cyan HotelHUB", hex: "#00a3cc" },
                            { name: "Púrpura", hex: "#8b5cf6" },
                            { name: "Verde Esmeralda", hex: "#10b981" },
                            { name: "Naranja Ámbar", hex: "#f59e0b" },
                            { name: "Azul Real", hex: "#2563eb" },
                            { name: "Rosa Crimson", hex: "#f43f5e" },
                            { name: "Oscuro Pizarra", hex: "#334155" },
                          ].map((s) => (
                            <button
                              key={s.hex}
                              type="button"
                              title={s.name}
                              onClick={() => field.onChange(s.hex)}
                              className={`h-6 w-6 rounded-full border border-black/20 transition-transform hover:scale-115 ${
                                field.value === s.hex ? "ring-2 ring-primary ring-offset-1 scale-110" : ""
                              }`}
                              style={{ backgroundColor: s.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Logo */}
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Logo del Producto (Imagen URL o Archivo)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="URL o sube una imagen del logo"
                            {...field}
                            value={field.value ?? ""}
                            className="h-9 text-xs"
                          />
                          <label className="cursor-pointer inline-flex items-center justify-center h-9 px-3 text-xs font-semibold rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground shrink-0 gap-1.5">
                            <UploadCloud className="h-3.5 w-3.5" />
                            <span>Subir</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === "string") {
                                      field.onChange(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(null)}
                              className="h-9 px-2 text-xs text-red-500 hover:text-red-700"
                              title="Quitar logo"
                            >
                              Quitar
                            </Button>
                          )}
                        </div>

                        {/* Vista Previa del Logo y Color */}
                        {(field.value || form.watch("color")) && (
                          <div className="flex items-center gap-2.5 p-2 rounded-lg border bg-background/50">
                            {field.value ? (
                              <img src={field.value} alt="Logo preview" className="h-8 w-auto max-w-[100px] object-contain rounded" />
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Sin logo</span>
                            )}
                            <div
                              className="h-4 w-4 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: form.watch("color") || "#9ca3af" }}
                            />
                            <span className="text-xs font-medium text-muted-foreground truncate">
                              Vista previa de marca
                            </span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="md:col-span-8 col-span-12 bg-modal p-4 rounded-lg flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{conceptLabel(tipo)}</h3>
              <Button
                type="button"
                size="icon"
                onClick={() => append({ nombre: "", descripcion_contrato: "", precio_mensual: 0, precio_anual: 0 })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {conceptos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay conceptos añadidos.
              </p>
            )}

            <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-3">
              {conceptos.length > 0 && (
                <div className="grid grid-cols-12 items-center gap-2 mb-1 font-semibold text-sm text-muted-foreground sticky top-0 bg-modal py-1 z-10">
                  <span className="col-span-1"></span>
                  <span className="col-span-5">Nombre del concepto</span>
                  <span className="col-span-3">Precio mensual</span>
                  <span className="col-span-2">Precio anual</span>
                  <span className="col-span-1"></span>
                </div>
              )}

              {conceptos.map((concepto, index) => (
              <div
                key={concepto.id || index}
                className="grid grid-cols-12 items-start gap-2 mb-4 rounded-lg border bg-background/30 p-3"
              >
                <span className="col-span-1 pt-2 text-sm text-muted-foreground">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>

                <div className="col-span-5">
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

                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name={`modulos.${index}.precio_mensual`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Mensual"
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

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`modulos.${index}.precio_anual`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Anual"
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
                <div className="col-span-12 pl-0 md:col-span-11 md:col-start-2">
                  <FormField
                    control={form.control}
                    name={`modulos.${index}.descripcion_contrato`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción para contrato</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Texto que aparecerá en el contrato para este concepto"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            </div>
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
