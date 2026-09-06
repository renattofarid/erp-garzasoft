import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import { FileText, List } from "lucide-react";

interface ContractCreatedDialogProps {
  open: boolean;
  contractNumber: string;
  onClose: () => void;
  onViewPdf: () => void;
  onDownloadWord?: () => void;
  onGoToList: () => void;
}

export function ContractCreatedDialog({
  open,
  contractNumber,
  onClose,
  onViewPdf,
  onDownloadWord,
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
          Puedes abrir el PDF o descargar el contrato en Word (.docx) para revisarlo antes de continuar.
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end sm:flex-wrap">
          <Button type="button" variant="outline" onClick={onViewPdf}>
            <FileText className="mr-2 h-4 w-4 text-rose-500" />
            Ver PDF
          </Button>
          {onDownloadWord && (
            <Button type="button" variant="outline" onClick={onDownloadWord}>
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              Descargar Word
            </Button>
          )}
          <Button type="button" onClick={onGoToList}>
            <List className="mr-2 h-4 w-4" />
            Ir al listado
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
