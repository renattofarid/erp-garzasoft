import { useEffect, useState } from "react";
import { useTypeUsers } from "../lib/typeUser.hook";
import TitleComponent from "@/components/TitleComponent";
import TypeUserActions from "./TypeUserActions";
import TypeUserTable from "./TypeUserTable";
import TypeUserOptions from "./TypeUserOptions";
import {
  TypeUserDescription,
  TypeUserIconName,
  TypeUserTitle,
} from "../lib/typeUser.interface";
import { deleteTypeUser } from "../lib/typeUser.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import TypeUserEditPage from "./TypeUserEditPage";
import { TypeUserColumns } from "./TypeUserColumns";
import DataTablePagination from "@/components/DataTablePagination";

export default function TypeUserPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useTypeUsers();

  useEffect(() => {
    refetch({ page, search });
  }, [page, search]);

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
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <TitleComponent
          title={TypeUserTitle}
          subtitle={TypeUserDescription}
          icon={TypeUserIconName}
        />
        <TypeUserActions />
      </div>

      {/* Tabla */}
      <TypeUserTable
        isLoading={isLoading}
        columns={TypeUserColumns({ onEdit: setEditId, onDelete: setDeleteId })}
        data={data || []}
      >
        <TypeUserOptions search={search} setSearch={setSearch} />
      </TypeUserTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
      />

      {/* Formularios */}
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
