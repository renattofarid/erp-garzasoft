import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "@/pages/client/components/ClientForm";
import { createEmptyClientNode, type ClientResource } from "@/pages/client/lib/client.interface";
import type { ClientSchema } from "@/pages/client/lib/client.schema";
import { useClientStore } from "@/pages/client/lib/client.store";
import { errorToast, successToast } from "@/lib/core.function";

interface ContractClientCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (client: ClientResource) => Promise<void> | void;
}

export const ContractClientCreateDialog = ({
  open,
  onOpenChange,
  onCreated,
}: ContractClientCreateDialogProps) => {
  const createClient = useClientStore((state) => state.createClient);
  const isSubmitting = useClientStore((state) => state.isSubmitting);
  const defaultValues = useMemo(() => createEmptyClientNode("local"), []);

  const handleSubmit = async (data: ClientSchema) => {
    try {
      const client = await createClient(data);
      await onCreated(client);
      onOpenChange(false);
      successToast("Cliente creado", "Se seleccionó automáticamente en el contrato.");
    } catch {
      errorToast("No se pudo crear el cliente", "Revisa los datos e inténtalo nuevamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] overflow-y-auto p-4 sm:w-[calc(100%-2rem)] sm:max-w-[calc(100%-2rem)] sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Plus className="h-5 w-5" />
            </span>
            Agregar cliente
          </DialogTitle>
          <DialogDescription>
            Registra el cliente sin salir del formulario de contrato.
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  );
};
