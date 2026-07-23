import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import ContractActions from "./ContractActions.tsx";
import ContractTable from "./ContractTable.tsx";
import ContractOptions from "./ContractOptions.tsx";
import { successToast, errorToast } from "@/lib/core.function";
import { ContractColumns } from "./ContractColumns.tsx";
import DataTablePagination from "@/components/DataTablePagination";
import {
  ContractDescription,
  ContractIconName,
  ContractTitle,
} from "@/pages/contract/lib/contract.interface.ts";
import { deleteContract } from "@/pages/contract/lib/contract.actions.ts";
import { openContractPdf } from "@/pages/contract/lib/contract.actions.ts";
import { useContracts } from "@/pages/contract/lib/contract.hook.ts";
import NotificationModal from "@/pages/notifications/components/NotificationModal.tsx";
import { ContractCancelDialog } from "./ContractCancelDialog.tsx";
import { ContractResource } from "../lib/contract.interface.ts";
import { ContractInstallmentsDialog } from "./ContractInstallmentsDialog.tsx";
import { ContractSignatureDialog } from "./ContractSignatureDialog.tsx";

export default function ContractPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [notificationId, setNotificationId] = useState<number | null>(null);
  const [installmentsContract, setInstallmentsContract] =
    useState<ContractResource | null>(null);
  const [signatureContract, setSignatureContract] =
    useState<ContractResource | null>(null);

  const { data, meta, isLoading, refetch } = useContracts();

  useEffect(() => {
    refetch({ page, search });
  }, [page, search]);

  const handleDelete = async (payload: {
    motivo_anulacion?: string;
    fecha_anulacion: string;
  }) => {
    if (!deleteId) return;
    try {
      await deleteContract(deleteId, payload);
      await refetch();
      successToast("Contrato anulado correctamente.");
    } catch {
      errorToast("Error al anular el Contrato.");
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
          onPreview: (id) => {
            openContractPdf(id).catch(() =>
              errorToast("No se pudo abrir el PDF del contrato.")
            );
          },
          onViewInstallments: setInstallmentsContract,
          onSignature: setSignatureContract,
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
        <ContractCancelDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
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
    </div>
  );
}
