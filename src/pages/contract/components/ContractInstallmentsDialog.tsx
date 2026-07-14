import { GeneralModal } from "@/components/GeneralModal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";
import { ContractResource } from "../lib/contract.interface";
import { format, parseISO } from "date-fns";

interface ContractInstallmentsDialogProps {
  open: boolean;
  onClose: () => void;
  contract: ContractResource | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
};

const formatMoney = (value: number) => `S/. ${value.toFixed(2)}`;

const getStatusLabel = (status: ContractResource["cuotas"][number]["situacion"]) => {
  switch (status) {
    case "pagado":
      return "Pagada";
    case "vencido":
      return "Vencida";
    default:
      return "Pendiente";
  }
};

const getStatusVariant = (status: ContractResource["cuotas"][number]["situacion"]) => {
  switch (status) {
    case "pagado":
      return "default" as const;
    case "vencido":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export function ContractInstallmentsDialog({
  open,
  onClose,
  contract,
}: ContractInstallmentsDialogProps) {
  const cuotas = contract?.cuotas ?? [];
  const total = cuotas.reduce((sum, cuota) => sum + Number(cuota.monto || 0), 0);

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={`Cuotas del contrato ${contract?.numero ?? ""}`}
      subtitle={
        contract
          ? `${getClientDisplayName(contract.cliente)} · ${cuotas.length} cuota${
              cuotas.length === 1 ? "" : "s"
            }`
          : "Detalle del cronograma de pagos."
      }
      maxWidth="max-w-4xl"
    >
      {!contract ? null : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Contrato</p>
              <p className="font-semibold">{contract.numero}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-semibold">{getClientDisplayName(contract.cliente)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total programado</p>
              <p className="font-semibold">{formatMoney(total)}</p>
            </div>
          </div>

          {cuotas.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Este contrato no tiene cuotas registradas.
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-modal">
                  <TableRow className="hover:!bg-modal">
                    <TableHead className="w-16 text-center">#</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Fecha de pago</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuotas.map((cuota, index) => (
                    <TableRow key={cuota.id}>
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>{formatMoney(Number(cuota.monto || 0))}</TableCell>
                      <TableCell>{formatDate(cuota.fecha_vencimiento)}</TableCell>
                      <TableCell>{formatDate(cuota.fecha_pago)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(cuota.situacion)}>
                          {getStatusLabel(cuota.situacion)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t bg-modal px-4 py-3 text-right text-sm font-semibold">
                Total cuotas: {formatMoney(total)}
              </div>
            </div>
          )}
        </div>
      )}
    </GeneralModal>
  );
}
