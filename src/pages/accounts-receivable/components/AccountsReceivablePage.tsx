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
import { AlertTriangle, CheckCircle2, Clock, DollarSign } from "lucide-react";

export default function CuentasPorCobrarPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [situacionFilter, setSituacionFilter] = useState<string>("");
  const [clienteIdFilter, setClienteIdFilter] = useState<string>("");
  const [contratoIdFilter, setContratoIdFilter] = useState<string>("");
  const [fechaDesdeFilter, setFechaDesdeFilter] = useState<string>("");
  const [fechaHastaFilter, setFechaHastaFilter] = useState<string>("");

  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [payId, setPayId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useCuentasPorCobrar();

  useEffect(() => {
    const params: Record<string, any> = { page, search };
    if (situacionFilter) params.situacion = situacionFilter;
    if (clienteIdFilter) params.cliente_id = clienteIdFilter;
    if (contratoIdFilter) params.contrato_id = contratoIdFilter;
    if (fechaDesdeFilter) params.fecha_vencimiento_desde = fechaDesdeFilter;
    if (fechaHastaFilter) params.fecha_vencimiento_hasta = fechaHastaFilter;

    refetch(params);
  }, [page, search, situacionFilter, clienteIdFilter, contratoIdFilter, fechaDesdeFilter, fechaHastaFilter]);

  const handleClearFilters = () => {
    setSearch("");
    setSituacionFilter("");
    setClienteIdFilter("");
    setContratoIdFilter("");
    setFechaDesdeFilter("");
    setFechaHastaFilter("");
    setPage(1);
  };

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

  // Cálculo de estadísticas resumidas
  const items = data || [];
  const totalMontoPendiente = items
    .filter((i) => i.situacion !== "pagado")
    .reduce((acc, i) => acc + (Number(i.monto_pendiente) || 0), 0);

  const totalMontoVencido = items
    .filter((i) => i.situacion === "vencido")
    .reduce((acc, i) => acc + (Number(i.monto_pendiente) || 0), 0);

  const totalMontoPagado = items
    .reduce((acc, i) => acc + (Number(i.monto_pagado) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <TitleComponent
          title={CuentasPorCobrarTitle}
          subtitle={CuentasPorCobrarDescription}
          icon={CuentasPorCobrarIconName}
        />
        <CuentasPorCobrarActions />
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pendiente
            </p>
            <p className="text-xl font-extrabold text-foreground">
              S/. {totalMontoPendiente.toFixed(2)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
              Total Vencido
            </p>
            <p className="text-xl font-extrabold text-destructive">
              S/. {totalMontoVencido.toFixed(2)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Cobrado
            </p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              S/. {totalMontoPagado.toFixed(2)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Registros / Cuotas
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {meta?.total || items.length} <span className="text-xs font-normal text-muted-foreground">cuotas</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
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
          setSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          situacionFilter={situacionFilter}
          setSituacionFilter={(v) => {
            setSituacionFilter(v);
            setPage(1);
          }}
          clienteIdFilter={clienteIdFilter}
          setClienteIdFilter={(v) => {
            setClienteIdFilter(v);
            setPage(1);
          }}
          contratoIdFilter={contratoIdFilter}
          setContratoIdFilter={(v) => {
            setContratoIdFilter(v);
            setPage(1);
          }}
          fechaDesdeFilter={fechaDesdeFilter}
          setFechaDesdeFilter={(v) => {
            setFechaDesdeFilter(v);
            setPage(1);
          }}
          fechaHastaFilter={fechaHastaFilter}
          setFechaHastaFilter={(v) => {
            setFechaHastaFilter(v);
            setPage(1);
          }}
          onClearFilters={handleClearFilters}
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
