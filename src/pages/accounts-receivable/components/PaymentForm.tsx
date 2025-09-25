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
import { Loader, Upload } from "lucide-react";
import {
  PagoSchema,
  pagoSchemaCreate,
  pagoSchemaUpdate,
} from "../lib/accounts-receivable.schema";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { useState } from "react";
import { CuentasPorCobrarResource } from "../lib/accounts-receivable.interface";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";

interface PagoFormProps {
  defaultValues: Partial<PagoSchema>;
  onSubmit: (data: PagoSchema & { comprobante?: File }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  cuota?: CuentasPorCobrarResource;
}

export const PagoForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  cuota,
}: PagoFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<PagoSchema>({
    resolver: zodResolver(
      mode === "create" ? pagoSchemaCreate : pagoSchemaUpdate
    ),
    defaultValues: {
      cuota_id: 0,
      fecha_pago: "",
      monto_pagado: 0,
      ...defaultValues,
    },
    mode: "onChange",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (data: PagoSchema) => {
    onSubmit({
      ...data,
      comprobante: selectedFile || undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
        {/* Información de la cuota */}
        {cuota && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Información de la Cuota</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Contrato:</span>{" "}
                <span className="font-medium">{cuota.contrato.numero}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cliente:</span>{" "}
                <span className="font-medium">
                  {cuota.contrato?.cliente?.razon_social ?? "Sin cliente"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Monto:</span>{" "}
                <span className="font-semibold">
                  S/. {cuota.monto.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Vencimiento:</span>{" "}
                <Badge variant="outline">
                  {format(
                    parse(
                      cuota.fecha_vencimiento.split("T").shift() || "",
                      "yyyy-MM-dd",
                      new Date()
                    ),
                    "yyyy-MM-dd"
                  )}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-modal rounded-lg">
          <FormField
            control={form.control}
            name="cuota_id"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DatePickerFormField
            control={form.control}
            name="fecha_pago"
            label="Fecha de Pago"
            placeholder="Selecciona la fecha de pago"
            captionLayout="dropdown"
            dateFormat="dd/MM/yyyy"
          />

          <FormField
            control={form.control}
            name="monto_pagado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Pagado</FormLabel>
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

          <div className="md:col-span-2">
            <FormLabel>Comprobante</FormLabel>
            <div className="mt-2">
              <label
                htmlFor="comprobante"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm font-medium text-primary">
                      {selectedFile.name}
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">
                          Haz clic para subir
                        </span>{" "}
                        o arrastra y suelta
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, PDF hasta 10MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="comprobante"
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                />
              </label>
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
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Registrando pago" : "Registrar pago"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
