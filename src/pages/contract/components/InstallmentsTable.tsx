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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Badge } from "@/components/ui/badge";

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

      <div className="rounded-lg border">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-modal">
              <TableRow className="hover:!bg-modal">
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead className="w-32 text-right">Monto (S/.)</TableHead>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead className="w-16 text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuotaFields.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="bg-background hover:bg-muted/50"
                >
                  <TableCell className="text-center">
                    <Badge>{index + 1}</Badge>
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`cuotas.${index}.monto`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              variant="neutral"
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
                  </TableCell>
                  <TableCell>
                    <DatePickerFormField
                      control={control}
                      variantButton="outline"
                      name={`cuotas.${index}.fecha_vencimiento`}
                      captionLayout="dropdown"
                      dateFormat="dd/MM/yyyy"
                      placeholder="Selecciona fecha"
                      onChange={() => onTrigger()}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeCuota(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y">
          {cuotaFields.map((row, index) => (
            <div key={row.id} className="p-4 space-y-3">
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
                    variantButton="outline"
                    name={`cuotas.${index}.fecha_vencimiento`}
                    captionLayout="dropdown"
                    dateFormat="dd/MM/yyyy"
                    placeholder="Selecciona fecha"
                    onChange={() => onTrigger()}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-modal border-t p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
            <span className="text-sm text-muted-foreground">
              {cuotaFields.length} cuota{cuotaFields.length !== 1 ? "s" : ""}{" "}
              configurada{cuotaFields.length !== 1 ? "s" : ""}
            </span>
            <div className="text-right">
              <div className="font-semibold">
                Total cuotas: S/. {currentInstallmentsSum.toFixed(2)}
              </div>
              {Math.abs(total - currentInstallmentsSum) > 0.01 && (
                <div className="text-sm text-destructive mt-1">
                  Diferencia: S/. {(total - currentInstallmentsSum).toFixed(2)}
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
  );
};
