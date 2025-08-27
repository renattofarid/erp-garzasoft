import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import NotificationActions from "./NotificationActions.tsx";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import DataTablePagination from "@/components/DataTablePagination";
import { useNotifications } from "../lib/notifications.hook.ts";
import { deleteNotifications } from "../lib/notifications.actions.ts";
import { NotificationsDescription, NotificationsIconName, NotificationsTitle } from "../lib/notifications.interface.ts";
import NotificationTable from "./NotificationTable.tsx";
import { NotificationColumns } from "./NotificationColumns.tsx";
import NotificationOptions from "./NotificationOptions.tsx";


export default function NotificationPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useNotifications();

  useEffect(() => {
    refetch({ page, search });
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteNotifications(deleteId);
      await refetch();
      successToast("Notificación eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el Notificación.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <TitleComponent
          title={NotificationsTitle}
          subtitle={NotificationsDescription}
          icon={NotificationsIconName}
        />
        <NotificationActions />
      </div>
      {/* Tabla */}
      <NotificationTable
        isLoading={isLoading}
        columns={NotificationColumns({ onDelete: setDeleteId })}
        data={data || []}
      >
        <NotificationOptions search={search} setSearch={setSearch} />
      </NotificationTable>
      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
      />
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
