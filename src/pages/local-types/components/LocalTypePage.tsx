import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/lib/core.function";
import { deleteLocalType } from "../lib/localType.actions";
import { useLocalTypes } from "../lib/localType.hook";
import {
  LocalTypeDescription,
  LocalTypeIconName,
  LocalTypeTitle,
} from "../lib/localType.interface";
import LocalTypeActions from "./LocalTypeActions";
import { LocalTypeColumns } from "./LocalTypeColumns";
import LocalTypeEditPage from "./LocalTypeEditPage";
import LocalTypeOptions from "./LocalTypeOptions";
import LocalTypeTable from "./LocalTypeTable";

export default function LocalTypePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useLocalTypes();

  useEffect(() => {
    refetch({ page, search });
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLocalType(deleteId);
      await refetch();
      successToast("Tipo de local eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el tipo de local.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={LocalTypeTitle}
          subtitle={LocalTypeDescription}
          icon={LocalTypeIconName}
        />
        <LocalTypeActions />
      </div>

      <LocalTypeTable
        isLoading={isLoading}
        columns={LocalTypeColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <LocalTypeOptions search={search} setSearch={setSearch} />
      </LocalTypeTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
      />

      {editId !== null && (
        <LocalTypeEditPage
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
