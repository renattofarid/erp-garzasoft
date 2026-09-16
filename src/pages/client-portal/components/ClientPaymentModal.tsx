import {
  CreditCard,
  Building2,
  Info,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CuentasPorCobrarResource } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { successToast } from "@/lib/core.function";

interface ClientPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cuota: CuentasPorCobrarResource | null;
}

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

export function ClientPaymentModal({
  open,
  onOpenChange,
  cuota,
}: ClientPaymentModalProps) {
  if (!cuota) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    successToast(`${label} copiado al portapapeles.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-6 gap-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Pagar Cuota de Servicio</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Contrato <strong className="text-foreground">{cuota.contrato?.numero || `ID #${cuota.contrato_id}`}</strong> • Vencimiento: {cuota.fecha_vencimiento}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Resumen del Pago */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-card dark:from-emerald-950/30 dark:via-zinc-900 border border-emerald-500/20 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Monto Pendiente a Cancelar</span>
            <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[11px]">
              {cuota.situacion}
            </Badge>
          </div>
          <div className="text-3xl font-extrabold text-foreground font-mono tracking-tight">
            {currency.format(Number(cuota.monto_pendiente || cuota.monto_total || 0))}
          </div>
        </div>

        {/* Aviso de Coordinación con Alex */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
            <Info className="h-4 w-4 shrink-0" />
            <span>Integración de Pasarela de Pago</span>
          </div>
          <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
            Para definir el funcionamiento de la pasarela de pago en línea automática (Tarjetas / PagoEfectivo) se encuentra agendada la reunión de trabajo con <strong>Alex</strong>.
          </p>
        </div>

        {/* Cuentas Bancarias Oficiales */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            Cuentas Bancarias Disponibles
          </h4>

          <div className="grid gap-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span>BCP (Soles)</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Corriente</Badge>
                </div>
                <div className="text-muted-foreground font-mono text-[11px]">305-98721345-0-82</div>
                <div className="text-[10px] text-muted-foreground">CCI: 002-305009872134508248</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard("002-305009872134508248", "CCI BCP")}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span>BBVA (Soles)</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Corriente</Badge>
                </div>
                <div className="text-muted-foreground font-mono text-[11px]">0011-0284-0100045812</div>
                <div className="text-[10px] text-muted-foreground">CCI: 011-284-000100045812-74</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard("011-284-000100045812-74", "CCI BBVA")}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="default" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto font-bold">
            Entendido / Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
