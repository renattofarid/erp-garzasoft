import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import DataTablePagination from "@/components/DataTablePagination";
import {
  CuentasPorCobrarDescription,
  CuentasPorCobrarIconName,
  CuentasPorCobrarTitle,
} from "../lib/accounts-receivable.interface";
import { deleteCuentaPorCobrar } from "../lib/accounts-receivable.actions";
import { useCuentasPorCobrar } from "../lib/accounts-receivable.hook";
import CuentasPorCobrarActions from "./AccountsReceivableActions";
import CuentasPorCobrarTable from "./AccountsReceivableTable";
import { CuentasPorCobrarColumns } from "./AccountsReceivableColumns";
import CuentasPorCobrarOptions from "./AccountsReceivableOptions";
import CuentasPorCobrarEditPage from "./AccountsReceivableEdit";
import PagoModal from "./PaymentModal";

export default function CuentasPorCobrarPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [situacionFilter, setSituacionFilter] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [payId, setPayId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useCuentasPorCobrar();

  useEffect(() => {
    const params: Record<string, any> = { page, search };
    if (situacionFilter) {
      params.situacion = situacionFilter;
    }
    refetch(params);
  }, [page, search, situacionFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCuentaPorCobrar(deleteId);
      await refetch();
      successToast("Cuenta por cobrar eliminada correctamente.");
    } catch {
      errorToast("Error al eliminar la cuenta por cobrar.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <TitleComponent
          title={CuentasPorCobrarTitle}
          subtitle={CuentasPorCobrarDescription}
          icon={CuentasPorCobrarIconName}
        />
        <CuentasPorCobrarActions />
      </div>

      {/* Tabla */}
      <CuentasPorCobrarTable
        isLoading={isLoading}
        columns={CuentasPorCobrarColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
          onPay: setPayId,
        })}
        data={data || []}
      >
        <CuentasPorCobrarOptions
          search={search}
          setSearch={setSearch}
          situacionFilter={situacionFilter}
          setSituacionFilter={setSituacionFilter}
        />
      </CuentasPorCobrarTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
      />

      {/* Modales */}
      {editId !== null && (
        <CuentasPorCobrarEditPage
          id={editId}
          open={true}
          setOpen={() => setEditId(null)}
          onSuccess={() => refetch()}
        />
      )}

      {payId !== null && (
        <PagoModal
          cuotaId={payId}
          open={true}
          setOpen={() => setPayId(null)}
          onSuccess={() => refetch()}
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
