import { useState } from "react";
import { useTypeUsers } from "../lib/client.hook.ts";
import TitleComponent from "@/components/TitleComponent";
import ClientActions from "./ClientActions.tsx";
import ClientTable from "./ClientTable.tsx";
import { clientColumns } from "./ClientColumns.tsx";
import ClientOptions from "./ClientOptions.tsx";
import { TypeUserIconName } from "../lib/client.interface.ts";
import { deleteTypeUser } from "../lib/client.actions.ts";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import ClientEditPage from "./ClientEditPage.tsx";

export default function ClientPage() {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useTypeUsers();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypeUser(deleteId);
      await refetch();
      successToast("Tipo de Usuario eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el Tipo de Usuario.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={"Tipos de Usuario"}
          subtitle={"Gestiona los tipos de usuario en el sistema."}
          icon={TypeUserIconName}
        />
        <ClientActions />
      </div>

      <ClientTable
        isLoading={isLoading}
        columns={clientColumns({ onEdit: setEditId, onDelete: setDeleteId })}
        data={data || []}
      >
        <ClientOptions search={search} setSearch={setSearch} />
      </ClientTable>

      {editId !== null && (
        <ClientEditPage
          id={editId}
          open={true}
          setOpen={() => setEditId(null)}
        />
      )}

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
