import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import DataTablePagination from "@/components/DataTablePagination";
import {
  CuentasPorCobrarDescription,
  CuentasPorCobrarIconName,
  CuentasPorCobrarResource,
  CuentasPorCobrarTitle,
} from "../lib/accounts-receivable.interface";
import { deleteCuentaPorCobrar, reenviarFacturaCuota } from "../lib/accounts-receivable.actions";
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
    if (situacionFilter) params.situacion = situacionFilter;
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

  const handleResendInvoice = async (cuota: CuentasPorCobrarResource) => {
    try {
      const response = await reenviarFacturaCuota(cuota.id);
      successToast(response?.message || "Factura reenviada correctamente.");
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "No se pudo reenviar la factura.");
    }
  };

  const handleWhatsAppReminder = (cuota: CuentasPorCobrarResource) => {
    const cliente = cuota.contrato?.cliente;
    const rawPhone = cliente?.dueno_celular || cliente?.representante_celular || "";
    const phone = rawPhone.replace(/\D/g, "");

    if (!phone) {
      errorToast("El cliente no tiene celular registrado para enviar WhatsApp.");
      return;
    }

    const message = [
      `Hola ${cliente?.dueno_nombre || cliente?.nombre_cliente || cliente?.razon_social || ""}.`,
      `Le recordamos el pago del contrato ${cuota.contrato?.numero}.`,
      `Monto pendiente: S/. ${Number(cuota.monto_pendiente).toFixed(2)}.`,
      `Fecha de vencimiento: ${cuota.fecha_vencimiento}.`,
    ].join(" ");

    const normalizedPhone = phone.startsWith("51") ? phone : `51${phone}`;
    window.open(`https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`, "_blank");
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
          onResendInvoice: handleResendInvoice,
          onWhatsAppReminder: handleWhatsAppReminder,
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
          onSuccess={() => refetch({ page })}
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
