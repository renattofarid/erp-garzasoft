import { ClientSchema } from "../lib/client.schema.ts";
import {
  ClientIconName,
  ClientRoute,
  ClientTitle,
} from "../lib/client.interface.ts";
import { errorToast, successToast } from "@/lib/core.function";
import { ClientForm } from "./ClientForm.tsx";
import { useClientStore } from "../lib/client.store.ts";
import TitleFormComponent from "@/components/TitleFormComponent.tsx";
import { useNavigate } from "react-router-dom";

export default function ClientAddPage() {
  const router = useNavigate();
  const { isSubmitting, createClient } = useClientStore();

  const handleSubmit = async (data: ClientSchema) => {
    await createClient(data)
      .then(() => {
        successToast("Cliente creado exitosamente");
        router(ClientRoute);
      })
      .catch(() => {
        errorToast("Hubo un error al crear el Cliente");
      });
  };

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
      <TitleFormComponent
        title={ClientTitle}
        mode="create"
        icon={ClientIconName}
      />
      <ClientForm
        defaultValues={{
          sucursales: [{ nombre: "" }],
          contactos: [{ nombre: "", celular: "", email: "" }],
          tipo: "",
          ruc: "",
          razon_social: "",
          dueno_nombre: "",
          dueno_celular: "",
          dueno_email: "",
          representante_nombre: "",
          representante_celular: "",
          representante_email: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={() => router(ClientRoute)}
      />
    </div>
  );
}
