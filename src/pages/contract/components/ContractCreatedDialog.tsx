import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import { FileText, List } from "lucide-react";

interface ContractCreatedDialogProps {
  open: boolean;
  contractNumber: string;
  onClose: () => void;
  onViewPdf: () => void;
  onGoToList: () => void;
}

export function ContractCreatedDialog({
  open,
  contractNumber,
  onClose,
  onViewPdf,
  onGoToList,
}: ContractCreatedDialogProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Contrato creado"
      subtitle={`El contrato ${contractNumber} ya fue registrado y está listo para revisión.`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
          Puedes abrir el PDF del contrato para revisarlo antes de continuar.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onViewPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Ver PDF
          </Button>
          <Button type="button" onClick={onGoToList}>
            <List className="mr-2 h-4 w-4" />
            Ir al listado
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
