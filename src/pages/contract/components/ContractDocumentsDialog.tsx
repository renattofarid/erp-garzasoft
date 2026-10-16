import { useEffect, useState } from "react";
import { Download, FileUp, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorToast, successToast } from "@/lib/core.function";
import {
  deleteContractDocument,
  downloadContractDocument,
  getContractDocuments,
  uploadContractDocuments,
} from "../lib/contract.actions";
import type { ContratoDocumentoResource } from "../lib/contract.interface";

interface Props {
  contractId: number | null;
  contractNumber?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatSize = (bytes?: number | null) => {
  if (!bytes) return "Tamaño no disponible";
  if (bytes < 1024 * 1024) return Math.ceil(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function ContractDocumentsDialog({
  contractId,
  contractNumber,
  open,
  onOpenChange,
}: Props) {
  const [documents, setDocuments] = useState<ContratoDocumentoResource[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || !contractId) return;
    setLoading(true);
    getContractDocuments(contractId)
      .then(setDocuments)
      .catch(() => errorToast("No se pudieron cargar los documentos."))
      .finally(() => setLoading(false));
  }, [contractId, open]);

  const handleUpload = async () => {
    if (!contractId || selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadContractDocuments(contractId, selectedFiles);
      setDocuments((current) => [...uploaded, ...current]);
      setSelectedFiles([]);
      successToast("Documentos subidos correctamente.");
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "No se pudieron subir los documentos.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: ContratoDocumentoResource) => {
    try {
      const blob = await downloadContractDocument(document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.nombre_original;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      errorToast("No se pudo descargar el documento.");
    }
  };

  const handleDelete = async (document: ContratoDocumentoResource) => {
    if (!window.confirm("¿Eliminar \"" + document.nombre_original + "\"?")) return;
    try {
      await deleteContractDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      successToast("Documento eliminado.");
    } catch {
      errorToast("No se pudo eliminar el documento.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Subir documentos
          </DialogTitle>
          <DialogDescription>
            Adjunta el alta y cualquier otro documento del contrato {contractNumber || ""}.
            El cliente podrá consultarlos desde su portal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center hover:bg-primary/10">
            <FileUp className="h-8 w-8 text-primary" />
            <span className="font-semibold">Seleccionar documentos</span>
            <span className="text-xs text-muted-foreground">
              Puedes seleccionar varios archivos (máximo 50 MB cada uno).
            </span>
            <input
              type="file"
              multiple
              className="sr-only"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.zip"
              onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
            />
          </label>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-semibold">Pendientes de subir</p>
              {selectedFiles.map((file) => (
                <div key={file.name + "-" + file.size} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedFiles((files) => files.filter((item) => item !== file))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleUpload} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                Subir seleccionados
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-semibold">Documentos disponibles</p>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando documentos...</p>
            ) : documents.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Aún no hay documentos cargados para este contrato.
              </p>
            ) : (
              documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{document.nombre_original}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(document.tamanio)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button type="button" variant="outline" size="icon" title="Descargar" onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" title="Eliminar" onClick={() => handleDelete(document)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
