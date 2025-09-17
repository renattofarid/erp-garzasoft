import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";

// Tipo específico para los elementos del field array de cuotas
interface CuotaField {
  id: string;
  monto: number;
  fecha_vencimiento: string;
}

interface PaymentSidebarProps {
  control: Control<any>;
  paymentMethod: string;
  total: number;
  fieldsLength: number;
  sum: number;
  manualSum: number;
  cuotaFields: (CuotaField & { id: string })[];
  numberOfInstallments: number;
  setNumberOfInstallments: (value: number) => void;
  generateInstallments: () => void;
  appendCuota: (value: any) => void;
  adjustExistingInstallments: () => void;
  isInstallmentsUnbalanced: boolean;
  currentInstallmentsSum: number;
  fechaInicio: string;
  fechaFin: string;
}

export const PaymentSidebar = ({
  control,
  paymentMethod,
  total,
  numberOfInstallments,
  setNumberOfInstallments,
  generateInstallments,
  appendCuota,
  adjustExistingInstallments,
  isInstallmentsUnbalanced,
  currentInstallmentsSum,
  fechaInicio,
  fechaFin,
}: PaymentSidebarProps) => {
  return (
    <div className="sticky top-4 space-y-3">
      {/* Sección de Pagos */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Pagos</h2>
            <p className="text-sm text-muted-foreground">
              Configuración de pagos
            </p>
          </div>
        </div>

        <div className="p-4 bg-modal border rounded-lg shadow-sm space-y-4">
          <FormSelect
            control={control}
            label="Forma de Pago"
            name="forma_pago"
            placeholder="Selecciona una forma de pago"
            options={[
              { label: "Pago Parcial (Cuotas)", value: "parcial" },
              { label: "Pago Único", value: "unico" },
            ]}
          />

          <FormField
            control={control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Total</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      S/.
                    </span>
                    <Input
                      type="number"
                      value={field.value ?? 0}
                      disabled
                      className="pl-10 font-semibold text-lg text-right"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Stats Rápidas */}
      {/* <div className="p-4 bg-modal border rounded-lg shadow-sm">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Productos:</span>
            <span className="font-medium">{fieldsLength}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">
              S/. {(manualSum || sum).toFixed(2)}
            </span>
          </div>
          {paymentMethod === "parcial" && cuotaFields.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cuotas:</span>
              <span className="font-medium">{cuotaFields.length}</span>
            </div>
          )}
        </div>
      </div> */}

      {/* Configuración de Cuotas */}
      {paymentMethod === "parcial" && (
        <div className="p-4 bg-modal border rounded-lg shadow-sm">
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="font-semibold mb-0">Configuración de Cuotas</h3>
              <p className="text-sm text-muted-foreground mb-0">
                Genera o agrega cuotas manualmente
              </p>
            </div>

            {/* Alerta de desbalance */}
            {isInstallmentsUnbalanced && (
              <div className="p-3 bg-muted border border-primary rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-bold">
                      !
                    </span>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    Cuotas desbalanceadas
                  </p>
                </div>
                <p className="text-xs text-primary mb-3">
                  Total: S/. {total.toFixed(2)} | Suma: S/.{" "}
                  {currentInstallmentsSum.toFixed(2)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={adjustExistingInstallments}
                  className="w-full"
                >
                  Ajustar cuotas
                </Button>
              </div>
            )}

            <div>
              <div className="space-y-2">
                <Input
                  type="number"
                  min="1"
                  max="48"
                  value={numberOfInstallments}
                  onChange={(e) =>
                    setNumberOfInstallments(Number(e.target.value))
                  }
                  placeholder="Número de cuotas"
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
                  className="w-full"
                  title={
                    !total || !fechaInicio || !fechaFin
                      ? "Completa: total, fecha inicio y fecha fin"
                      : numberOfInstallments < 1
                      ? "El número de cuotas debe ser mayor a 0"
                      : "Generar cuotas automáticamente"
                  }
                >
                  Generar {numberOfInstallments} cuotas
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => appendCuota({ monto: 0, fecha_vencimiento: "" })}
                className="w-full"
              >
                Agregar cuota manual
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
