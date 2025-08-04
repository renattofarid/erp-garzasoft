import { useState } from "react";
import { useTypeUsers } from "../lib/typeUser.hook";
import TitleComponent from "@/components/TitleComponent";
import TypeUserActions from "./TypeUserActions";
import TypeUserTable from "./TypeUserTable";
import { typeUserColumns } from "./TypeUserColumns";
import TypeUserOptions from "./TypeUserOptions";
import { TypeUserIconName } from "../lib/typeUser.interface";
import { deleteTypeUser } from "../lib/typeUser.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import TypeUserEditPage from "./TypeUserEditPage";

export default function TypeUserPage() {
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
        <TypeUserActions />
      </div>

      <TypeUserTable
        isLoading={isLoading}
        columns={typeUserColumns({ onEdit: setEditId, onDelete: setDeleteId })}
        data={data || []}
      >
        <TypeUserOptions search={search} setSearch={setSearch} />
      </TypeUserTable>

      {editId !== null && (
        <TypeUserEditPage
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
