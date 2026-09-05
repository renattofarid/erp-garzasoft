import FormSkeleton from "@/components/FormSkeleton";
import { errorToast, successToast } from "@/lib/core.function";
import { useContractStore } from "../lib/contract.store.ts";
import { useContracts } from "../lib/contract.hook.ts";
import { ContractForm } from "./ContractForm.tsx";
import {
  ContractIconName,
  ContractRoute,
  ContractTitle,
} from "@/pages/contract/lib/contract.interface.ts";
import { ContractCreate } from "@/pages/contract/lib/contract.schema.ts";
import TitleFormComponent from "@/components/TitleFormComponent.tsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getNextContractNumber, openContractPdf, downloadContractWord } from "../lib/contract.actions.ts";
import { ContractCreatedDialog } from "./ContractCreatedDialog.tsx";

export default function ContractAddPage() {
  const { isSubmitting, createContract } = useContractStore();
  const { refetch } = useContracts();
  const router = useNavigate();
  const [nextNumber, setNextNumber] = useState<string>("");
  const [isLoadingNumber, setIsLoadingNumber] = useState<boolean>(true);
  const [createdContract, setCreatedContract] = useState<{
    id: number;
    numero: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    getNextContractNumber()
      .then((num) => {
        if (isMounted) {
          setNextNumber(num);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNextNumber(`CT-${new Date().getFullYear()}-001`);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingNumber(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (data: ContractCreate) => {
    await createContract(data)
      .then((response) => {
        successToast("Contrato creado exitosamente");
        refetch();
        setCreatedContract({
          id: response.data.id,
          numero: response.data.numero,
        });
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Error al crear el contrato"
        );
      });
  };

  if (isLoadingNumber) {
    return (
      <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
        <TitleFormComponent
          title={ContractTitle}
          mode="create"
          icon={ContractIconName}
        />
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
      <TitleFormComponent
        title={ContractTitle}
        mode="create"
        icon={ContractIconName}
      />
      <ContractForm
        defaultValues={{
          numero: nextNumber,
          fecha_inicio: "",
          fecha_fin: "",
          cliente_padre_id: undefined as unknown as number,
          cliente_id: 0,
          forma_pago: "parcial",
          periodicidad_cuota: "mensual",
          costo_instalacion: 100,
          tipo_contrato: "saas",
          vigencia_contrato: "anual",
          duracion_anios: 1,
          total: 0,
          productos_modulos: [],
          cuotas: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={() => router(ContractRoute)}
        key={nextNumber}
      />
      <ContractCreatedDialog
        open={createdContract !== null}
        contractNumber={createdContract?.numero ?? ""}
        onClose={() => setCreatedContract(null)}
        onViewPdf={() => {
          if (!createdContract) return;
          openContractPdf(createdContract.id).catch(() =>
            errorToast("No se pudo abrir el PDF del contrato.")
          );
        }}
        onDownloadWord={() => {
          if (!createdContract) return;
          downloadContractWord(createdContract.id, createdContract.numero)
            .then(() => successToast("Descargando contrato en Word (.docx)..."))
            .catch(() => errorToast("No se pudo descargar el Word del contrato."));
        }}
        onGoToList={() => {
          setCreatedContract(null);
          router(ContractRoute);
        }}
      />
    </div>
  );
}
