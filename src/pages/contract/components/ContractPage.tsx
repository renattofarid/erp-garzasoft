import { useCallback, useEffect, useMemo, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import ContractActions from "./ContractActions.tsx";
import ContractTable from "./ContractTable.tsx";
import ContractOptions, { ContractFiltersState } from "./ContractOptions.tsx";
import { successToast, errorToast } from "@/lib/core.function";
import { ContractColumns } from "./ContractColumns.tsx";
import DataTablePagination from "@/components/DataTablePagination";
import {
  ContractDescription,
  ContractIconName,
  ContractTitle,
} from "@/pages/contract/lib/contract.interface.ts";
import { deleteContract, openContractPdf, downloadContractWord } from "@/pages/contract/lib/contract.actions.ts";
import { useContracts } from "@/pages/contract/lib/contract.hook.ts";
import NotificationModal from "@/pages/notifications/components/NotificationModal.tsx";
import { ContractCancelDialog } from "./ContractCancelDialog.tsx";
import { ContractResource } from "../lib/contract.interface.ts";
import { ContractInstallmentsDialog } from "./ContractInstallmentsDialog.tsx";
import { ContractSignatureDialog } from "./ContractSignatureDialog.tsx";
import ContractActaModal from "./ContractActaModal.tsx";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";

const initialFilters: ContractFiltersState = {
  search: "",
  numero: "",
  clienteId: "",
  productoId: "",
  createdFrom: "",
  createdTo: "",
  vigenciaFrom: "",
  vigenciaTo: "",
};

export default function ContractPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ContractFiltersState>(initialFilters);
  const [cancelContract, setCancelContract] = useState<ContractResource | null>(null);
  const [deleteContractItem, setDeleteContractItem] = useState<ContractResource | null>(null);
  const [notificationId, setNotificationId] = useState<number | null>(null);
  const [installmentsContract, setInstallmentsContract] =
    useState<ContractResource | null>(null);
  const [signatureContract, setSignatureContract] =
    useState<ContractResource | null>(null);
  const [actaContract, setActaContract] =
    useState<ContractResource | null>(null);

  const { data, meta, isLoading, refetch } = useContracts();

  useEffect(() => {
    refetch({
      page,
      search: filters.search || undefined,
      numero: filters.numero || undefined,
      cliente_id:
        filters.clienteId && filters.clienteId !== "all"
          ? Number(filters.clienteId)
          : undefined,
      producto_id:
        filters.productoId && filters.productoId !== "all"
          ? Number(filters.productoId)
          : undefined,
      created_from: filters.createdFrom || undefined,
      created_to: filters.createdTo || undefined,
      vigencia_from: filters.vigenciaFrom || undefined,
      vigencia_to: filters.vigenciaTo || undefined,
    });
  }, [
    page,
    filters.search,
    filters.numero,
    filters.clienteId,
    filters.productoId,
    filters.createdFrom,
    filters.createdTo,
    filters.vigenciaFrom,
    filters.vigenciaTo,
  ]);

  const handleFilterChange = useCallback(
    <K extends keyof ContractFiltersState>(key: K, value: ContractFiltersState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
      setPage(1);
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, []);

  const handleCancelContract = async (payload: {
    motivo_anulacion?: string;
    fecha_anulacion: string;
  }) => {
    if (!cancelContract) return;
    try {
      await deleteContract(cancelContract.id, payload);
      await refetch();
      successToast("Contrato anulado correctamente.");
    } catch {
      errorToast("Error al anular el Contrato.");
    } finally {
      setCancelContract(null);
    }
  };

  const handleDeleteContract = async () => {
    if (!deleteContractItem) return;
    try {
      await deleteContract(deleteContractItem.id);
      await refetch();
      successToast("Contrato eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el Contrato.");
    } finally {
      setDeleteContractItem(null);
    }
  };

  const columns = useMemo(
    () =>
      ContractColumns({
        onDelete: (contract) => {
          if (contract.estado === "anulado") {
            setDeleteContractItem(contract);
          } else {
            setCancelContract(contract);
          }
        },
        onNotification: setNotificationId,
        onPreview: (id) => {
          openContractPdf(id).catch(() =>
            errorToast("No se pudo abrir el PDF del contrato.")
          );
        },
        onDownloadWord: (id, numero) => {
          downloadContractWord(id, numero)
            .then(() => successToast("Descargando contrato en Word (.docx)..."))
            .catch(() => errorToast("No se pudo descargar el Word del contrato."));
        },
        onViewInstallments: setInstallmentsContract,
        onSignature: setSignatureContract,
        onGenerateActa: setActaContract,
      }),
    []
  );

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
        columns={columns}
        data={data || []}
      >
        <ContractOptions
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
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
      {cancelContract !== null && (
        <ContractCancelDialog
          open={true}
          onOpenChange={(open) => !open && setCancelContract(null)}
          onConfirm={handleCancelContract}
        />
      )}
      {deleteContractItem !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteContractItem(null)}
          onConfirm={handleDeleteContract}
        />
      )}
      <ContractInstallmentsDialog
        open={installmentsContract !== null}
        onClose={() => setInstallmentsContract(null)}
        contract={installmentsContract}
      />
      <ContractSignatureDialog
        open={signatureContract !== null}
        onOpenChange={(open) => !open && setSignatureContract(null)}
        contract={signatureContract}
        onSuccess={() => refetch()}
      />
      <ContractActaModal
        open={actaContract !== null}
        onOpenChange={(open) => !open && setActaContract(null)}
        contract={actaContract}
      />
    </div>
  );
}
