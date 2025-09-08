import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import ContractActions from "./ContractActions.tsx";
import ContractTable from "./ContractTable.tsx";
import ContractOptions from "./ContractOptions.tsx";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { ContractColumns } from "./ContractColumns.tsx";
import DataTablePagination from "@/components/DataTablePagination";
import {
  ContractDescription,
  ContractIconName,
  ContractTitle,
} from "@/pages/contract/lib/contract.interface.ts";
import { deleteContract } from "@/pages/contract/lib/contract.actions.ts";
import { useContracts } from "@/pages/contract/lib/contract.hook.ts";
import NotificationModal from "@/pages/notifications/components/NotificationModal.tsx";

export default function ContractPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [notificationId, setNotificationId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useContracts();

  useEffect(() => {
    refetch({ page, search });
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContract(deleteId);
      await refetch();
      successToast("Contrato eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el Contrato.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <TitleComponent
          title={ContractTitle}
          subtitle={ContractDescription}
          icon={ContractIconName}
        />
        <ContractActions />
      </div>
      {/* Tabla */}
      <ContractTable
        isLoading={isLoading}
        columns={ContractColumns({
          onDelete: setDeleteId,
          onNotification: setNotificationId,
        })}
        data={data || []}
      >
        <ContractOptions search={search} setSearch={setSearch} />
      </ContractTable>
      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
      />
      {/* Notificaciones */}
      {notificationId !== null && (
        <NotificationModal
          id={notificationId}
          open={true}
          setOpen={(open) => !open && setNotificationId(null)}
        />
      )}
      {/* Formularios */}
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
