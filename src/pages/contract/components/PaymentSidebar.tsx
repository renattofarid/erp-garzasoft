import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, CalendarDays, Plus, AlertCircle } from "lucide-react";

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
  dueDayType: "fin_mes" | "inicio_mes";
  setDueDayType: (value: "fin_mes" | "inicio_mes") => void;
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
  dueDayType,
  setDueDayType,
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
          <p className="text-sm text-muted-foreground">Configuración de cuotas</p>
        </div>
      </div>

      {paymentMethod === "parcial" && (
        <div className="p-4 bg-modal/70 border rounded-xl shadow-xs">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-semibold mb-0 text-base">Configuración de Cuotas</h3>
              <p className="text-xs text-muted-foreground mb-0">
                Genera o agrega cuotas manualmente
              </p>
            </div>

            {isInstallmentsUnbalanced && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-xs font-bold text-destructive">Cuotas desbalanceadas</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2.5">
                  Total: S/. {total.toFixed(2)} | Suma: S/. {currentInstallmentsSum.toFixed(2)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={adjustExistingInstallments}
                  className="w-full h-8 text-xs font-medium"
                >
                  Ajustar cuotas
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Número de cuotas
                </label>
                <Input
                  type="number"
                  min="1"
                  value={numberOfInstallments}
                  onChange={(event) => {
                    const value = Math.max(1, Number(event.target.value) || 1);
                    setInstallmentsTouched(true);
                    setNumberOfInstallments(value);
                  }}
                  placeholder="Número de cuotas"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Vencimiento de cuotas
                </label>
                <Select
                  value={dueDayType}
                  onValueChange={(val: "fin_mes" | "inicio_mes") => setDueDayType(val)}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Selecciona el vencimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fin_mes">Fin de mes</SelectItem>
                    <SelectItem value="inicio_mes">Inicio de mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={generateInstallments}
                disabled={!total || !fechaInicio || !fechaFin || numberOfInstallments < 1}
                className="w-full mt-1 gap-2 shadow-2xs"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Generar cronograma {numberOfInstallments > 0 ? `(${numberOfInstallments} cuota${numberOfInstallments === 1 ? "" : "s"})` : ""}</span>
              </Button>
            </div>

            <div className="pt-2 border-t">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => appendCuota({ monto: 0, fecha_vencimiento: "" })}
                className="w-full gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar cuota manual</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
