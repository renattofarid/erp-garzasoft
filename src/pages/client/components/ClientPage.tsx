import { useState } from "react";
import { useClients } from "../lib/client.hook.ts";
import TitleComponent from "@/components/TitleComponent";
import ClientActions from "./ClientActions.tsx";
import ClientTable from "./ClientTable.tsx";
import ClientOptions from "./ClientOptions.tsx";
import {
  ClientDescription,
  ClientIconName,
  ClientTitle,
} from "../lib/client.interface.ts";
import { deleteClient } from "../lib/client.actions.ts";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { ClientColumns } from "./ClientColumns.tsx";

export default function ClientPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useClients();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClient(deleteId);
      await refetch();
      successToast("Cliente eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el Cliente.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={ClientTitle}
          subtitle={ClientDescription}
          icon={ClientIconName}
        />
        <ClientActions />
      </div>

      <ClientTable
        isLoading={isLoading}
        columns={ClientColumns({ onDelete: setDeleteId })}
        data={data || []}
      >
        <ClientOptions search={search} setSearch={setSearch} />
      </ClientTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
