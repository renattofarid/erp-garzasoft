import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface CuotaField {
  id: string;
  monto: number;
  fecha_vencimiento: string;
}

interface PaymentSidebarProps {
  paymentMethod: string;
  total: number;
  cuotaFields: (CuotaField & { id: string })[];
  numberOfInstallments: number;
  setNumberOfInstallments: (value: number) => void;
  setInstallmentsTouched: (value: boolean) => void;
  generateInstallments: () => void;
  appendCuota: (value: any) => void;
  adjustExistingInstallments: () => void;
  isInstallmentsUnbalanced: boolean;
  currentInstallmentsSum: number;
  fechaInicio: string;
  fechaFin: string;
}

export const PaymentSidebar = ({
  paymentMethod,
  total,
  numberOfInstallments,
  setNumberOfInstallments,
  setInstallmentsTouched,
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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Pagos</h2>
          <p className="text-sm text-muted-foreground">Configuracion de cuotas</p>
        </div>
      </div>

      {paymentMethod === "parcial" && (
        <div className="p-4 bg-modal border rounded-lg shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-semibold mb-0">Configuracion de Cuotas</h3>
              <p className="text-sm text-muted-foreground mb-0">
                Genera o agrega cuotas manualmente
              </p>
            </div>

            {isInstallmentsUnbalanced && (
              <div className="p-3 bg-muted border border-primary rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-bold">!</span>
                  </div>
                  <p className="text-sm font-bold text-primary">Cuotas desbalanceadas</p>
                </div>
                <p className="text-xs text-primary mb-3">
                  Total: S/. {total.toFixed(2)} | Suma: S/. {currentInstallmentsSum.toFixed(2)}
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

            <div className="space-y-2">
              <Input
                type="number"
                min="1"
                value={numberOfInstallments}
                onChange={(event) => {
                  const value = Math.max(1, Number(event.target.value) || 1);
                  setInstallmentsTouched(true);
                  setNumberOfInstallments(value);
                }}
                placeholder="Numero de cuotas"
              />
              <Button
                type="button"
                size="sm"
                onClick={generateInstallments}
                disabled={!total || !fechaInicio || !fechaFin || numberOfInstallments < 1}
                className="w-full"
              >
                Generar cronograma {numberOfInstallments > 0 ? `(${numberOfInstallments} cuota${numberOfInstallments === 1 ? "" : "s"})` : ""}
              </Button>
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
