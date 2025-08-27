import { errorToast, successToast } from "@/lib/core.function";

import { ContractForm } from "./ContractForm.tsx";
import {
  ContractIconName,
  ContractRoute,
  ContractTitle,
} from "@/pages/contract/lib/contract.interface.ts";
import { ContractCreate } from "@/pages/contract/lib/contract.schema.ts";
import TitleFormComponent from "@/components/TitleFormComponent.tsx";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../lib/notifications.store.ts";
import { useNotifications } from "../lib/notifications.hook.ts";

export default function ContractAddPage() {
  const { isSubmitting, createNotification } = useNotificationStore();
  const { refetch } = useNotifications();
  const router = useNavigate();

  const handleSubmit = async (data: ContractCreate) => {
    await createNotification(data)
      .then(() => {
        successToast("Contrato creado exitosamente");
        router(ContractRoute);
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al crear el Contrato");
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
          forma_pago: "",
          tipo_contrato: "",
          total: 0,
          productos_modulos: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={() => router(ContractRoute)}
      />
    </div>
  );
}
