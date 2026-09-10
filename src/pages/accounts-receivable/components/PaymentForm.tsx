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
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
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
import { getClientDisplayName } from "@/pages/client/lib/client.interface";

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
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const montoPendiente = Number(
    cuota?.monto_pendiente ?? defaultValues?.monto_pendiente ?? 0
  );
  const montoTotal = Number(
    cuota?.monto_total ?? defaultValues?.monto_total ?? 0
  );
  const montoPagado = Number(
    cuota?.monto_pagado ?? defaultValues?.monto_pagado ?? 0
  );

  const form = useForm<PagoSchema>({
    resolver: zodResolver(
      mode === "create" ? pagoSchemaCreate : pagoSchemaUpdate
    ),
    defaultValues: {
      cuota_id: defaultValues?.cuota_id ?? cuota?.id ?? 0,
      fecha_pago: defaultValues?.fecha_pago || todayStr,
      monto_pagado: montoPendiente > 0 ? montoPendiente : montoTotal,
      monto_pendiente: montoPendiente,
      monto_total: montoTotal,
    },
    mode: "onChange",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (data: PagoSchema) => {
    if (montoTotal && data.monto_pagado > montoTotal) {
      form.setError("monto_pagado", {
        message: "El monto a pagar no puede ser mayor al monto total de la cuota.",
      });
      return;
    }

    if (montoPendiente && data.monto_pagado > montoPendiente + 0.01) {
      form.setError("monto_pagado", {
        message: `El monto no puede exceder el saldo pendiente (S/. ${montoPendiente.toFixed(2)}).`,
      });
      return;
    }

    onSubmit({
      ...data,
      comprobante: selectedFile || undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 w-full"
      >
        {/* Información destacada de la cuota */}
        {cuota && (
          <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-3.5 shadow-2xs">
            {/* Header del contrato y cliente */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-semibold text-xs py-0.5 px-2 bg-background">
                  Contrato: {cuota.contrato?.numero || "-"}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span>{getClientDisplayName(cuota.contrato?.cliente)}</span>
                </div>
              </div>

              {cuota.fecha_vencimiento && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>Vencimiento:</span>
                  <Badge
                    variant={cuota.situacion === "vencido" ? "destructive" : "secondary"}
                    className="font-medium text-xs px-2 py-0.5"
                  >
                    {format(
                      parse(
                        cuota.fecha_vencimiento.split("T").shift() || "",
                        "yyyy-MM-dd",
                        new Date()
                      ),
                      "dd/MM/yyyy"
                    )}
                  </Badge>
                </div>
              )}
            </div>

            {/* Tarjetas de métricas financieras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-background/90 border border-border/60 rounded-lg p-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Monto Total
                </span>
                <span className="text-base font-bold text-foreground">
                  S/. {montoTotal.toFixed(2)}
                </span>
              </div>

              <div className="bg-background/90 border border-border/60 rounded-lg p-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Monto Pagado
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  S/. {montoPagado.toFixed(2)}
                </span>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                  Saldo por Pagar
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  S/. {montoPendiente.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Campos del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card border border-border/80 rounded-xl shadow-2xs">
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

          {/* Fecha de Pago con valor por defecto de HOY */}
          <DatePickerFormField
            control={form.control}
            name="fecha_pago"
            label="Fecha de Pago"
            placeholder="Selecciona la fecha de pago"
            captionLayout="dropdown"
            dateFormat="dd/MM/yyyy"
          />

          {/* Monto por pagar con helper rápido */}
          <FormField
            control={form.control}
            name="monto_pagado"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">Monto a Registrar (S/.)</FormLabel>
                  {montoPendiente > 0 && (
                    <button
                      type="button"
                      onClick={() => form.setValue("monto_pagado", montoPendiente, { shouldValidate: true })}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Pagar todo (S/. {montoPendiente.toFixed(2)})
                    </button>
                  )}
                </div>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      S/.
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9 text-base font-semibold"
                      max={montoPendiente > 0 ? montoPendiente : montoTotal}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subida de Comprobante / Voucher */}
          <div className="md:col-span-2 space-y-1.5">
            <FormLabel className="text-sm font-medium">Comprobante o Voucher de Pago</FormLabel>
            
            {selectedFile ? (
              <div className="flex items-center justify-between p-3.5 border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="size-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="size-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate max-w-[280px] sm:max-w-[400px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                  onClick={handleRemoveFile}
                  aria-label="Quitar archivo"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="comprobante"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all group"
              >
                <div className="flex flex-col items-center justify-center py-4 px-2 text-center">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-0.5">
                    <span className="text-primary font-semibold">Haz clic para seleccionar</span> o arrastra el archivo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos admitidos: PNG, JPG, PDF (hasta 10MB)
                  </p>
                </div>
                <input
                  id="comprobante"
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 w-full justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-sm gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registrando pago...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Registrar pago</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
