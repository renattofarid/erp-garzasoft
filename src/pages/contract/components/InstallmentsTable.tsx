import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, Trash } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";

// Tipo específico para los elementos del field array de cuotas
interface CuotaField {
  id: string;
  monto: number;
  fecha_vencimiento: string;
}

interface InstallmentsTableProps {
  control: Control<any>;
  cuotaFields: (CuotaField & { id: string })[];
  removeCuota: (index: number) => void;
  total: number;
  currentInstallmentsSum: number;
  onTrigger: () => void;
}

export const InstallmentsTable = ({
  control,
  cuotaFields,
  removeCuota,
  total,
  currentInstallmentsSum,
  onTrigger,
}: InstallmentsTableProps) => {
  if (cuotaFields.length <= 3) {
    return null; // Se muestra en el sidebar cuando hay pocas cuotas
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Detalle de Cuotas</h2>
          <p className="text-sm text-muted-foreground">
            Cronograma de pagos configurado
          </p>
        </div>
      </div>

      <div className="p-6 bg-modal border rounded-lg shadow-sm">
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="hidden md:block bg-muted/50 border-b border-border">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Monto (S/.)</div>
              <div className="col-span-5">Fecha de Vencimiento</div>
              <div className="col-span-1 text-center">Acción</div>
            </div>
          </div>

          {/* Body */}
          <div className="divide-y divide-border">
            {cuotaFields.map((row, index) => (
              <div key={row.id}>
                {/* Desktop View */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="col-span-1 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </span>
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
                              placeholder="0.00"
                              {...field}
                              value={field.value ?? ""}
                              className="text-right"
                              onChange={(e) => {
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                                );
                                onTrigger();
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
                      placeholder="Selecciona fecha"
                      onChange={() =>{ onTrigger()}}
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeCuota(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeCuota(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Monto (S/.)
                      </p>
                      <FormField
                        control={control}
                        name={`cuotas.${index}.monto`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value ?? ""}
                                className="text-right"
                                onChange={(e) => {
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value)
                                  );
                                  onTrigger();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Fecha de Vencimiento
                      </p>
                      <DatePickerFormField
                        control={control}
                        name={`cuotas.${index}.fecha_vencimiento`}
                        captionLayout="dropdown"
                        dateFormat="dd/MM/yyyy"
                        placeholder="Selecciona fecha"
                        onChange={() => onTrigger()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-muted/30 border-t border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                {cuotaFields.length} cuota{cuotaFields.length !== 1 ? "s" : ""}{" "}
                configurada{cuotaFields.length !== 1 ? "s" : ""}
              </span>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  Total cuotas: S/. {currentInstallmentsSum.toFixed(2)}
                </div>
                {Math.abs(total - currentInstallmentsSum) > 0.01 && (
                  <div className="text-sm text-destructive mt-1">
                    Diferencia: S/.{" "}
                    {(total - currentInstallmentsSum).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full justify-center mt-4">
          <FormField
            control={control}
            name="cuotas"
            render={() => <FormMessage />}
          />
        </div>
      </div>
    </div>
  );
};
