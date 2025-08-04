"use client";

import { errorToast, successToast } from "@/lib/core.function";
import { ClientSchema } from "../lib/client.schema.ts";
import { ClientResource, ClientTitle } from "../lib/client.interface.ts";
import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import { ClientForm } from "./ClientForm.tsx";
import { useClientStore } from "../lib/client.store.ts";
import { useClient, useClients } from "../lib/client.hook.ts";
import { GeneralModal } from "@/components/GeneralModal";
import { useParams } from "react-router-dom";

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();

  if (!id || isNaN(Number(id))) {
    return <NotFound />;
  }

  const { data: client, isFinding } = useClient(Number(id));
  const { refetch } = useClients();
  const { isSubmitting, updateClient } = useClientStore();

  const handleSubmit = async (data: ClientSchema) => {
    await updateClient(id, data)
      .then(() => {
        successToast("Tipo de Usuario actualizado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el Tipo de Usuario");
      });
  };

  const mapClientToForm = (data: ClientResource): Partial<ClientSchema> => ({
    nombre: data.nombre,
  });

  if (!client) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={"Actualizar " + ClientTitle}
      maxWidth="max-w-(--breakpoint-lg)"
    >
      {isFinding ? (
        <FormSkeleton />
      ) : (
        <ClientForm
          defaultValues={mapClientToForm(client)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />
      )}
    </GeneralModal>
  );
}
