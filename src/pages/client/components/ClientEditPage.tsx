"use client";

import { errorToast, successToast } from "@/lib/core.function";
import { ClientSchema } from "../lib/client.schema.ts";
import { TypeUserResource, TypeUserTitle } from "../lib/client.interface.ts";
import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import { ClientForm } from "./ClientForm.tsx";
import { useTypeUserStore } from "../lib/client.store.ts";
import { useTypeUser, useTypeUsers } from "../lib/client.hook.ts";
import { GeneralModal } from "@/components/GeneralModal";

export default function ClientEditPage({
  id,
  open,
  setOpen,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!id) return <NotFound />;

  const { data: typeUser, isFinding } = useTypeUser(id);
  const { refetch } = useTypeUsers();
  const { isSubmitting, updateTypeUser } = useTypeUserStore();

  const handleSubmit = async (data: ClientSchema) => {
    await updateTypeUser(id, data)
      .then(() => {
        setOpen(false);
        successToast("Tipo de Usuario actualizado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el Tipo de Usuario");
      });
  };

  const mapTypeUserToForm = (
    data: TypeUserResource
  ): Partial<ClientSchema> => ({
    nombre: data.nombre,
  });

  if (!typeUser) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={"Actualizar " + TypeUserTitle}
      maxWidth="max-w-(--breakpoint-lg)"
    >
      {isFinding ? (
        <FormSkeleton />
      ) : (
        <ClientForm
          defaultValues={mapTypeUserToForm(typeUser)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />
      )}
    </GeneralModal>
  );
}
