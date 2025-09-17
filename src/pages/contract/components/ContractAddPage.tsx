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

export default function ContractAddPage() {
  const { isSubmitting, createContract } = useContractStore();
  const { refetch } = useContracts();
  const router = useNavigate();

  const handleSubmit = async (data: ContractCreate) => {
    await createContract(data)
      .then(() => {
        successToast("Contrato creado exitosamente");
        router(ContractRoute);
        refetch();
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Error al crear el contrato"
        );
      });
  };

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
      <TitleFormComponent
        title={ContractTitle}
        mode="create"
        icon={ContractIconName}
      />
      <ContractForm
        defaultValues={{
          numero: "",
          fecha_inicio: "",
          fecha_fin: "",
          cliente_id: 0,
          forma_pago: "unico",
          tipo_contrato: "saas",
          total: 0,
          productos_modulos: [],
          cuotas: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={() => router(ContractRoute)}
      />
    </div>
  );
}
