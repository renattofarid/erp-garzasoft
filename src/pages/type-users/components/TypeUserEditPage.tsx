"use client";

import { errorToast, successToast } from "@/lib/core.function";
import { TypeUserSchema } from "../lib/typeUser.schema";
import {
  TypeUserDescriptionEdit,
  TypeUserResource,
  TypeUserTitle,
} from "../lib/typeUser.interface";
import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import { TypeUserForm } from "./TypeUserForm";
import { useTypeUserStore } from "../lib/typeUsers.store";
import { useTypeUser, useTypeUsers } from "../lib/typeUser.hook";
import { GeneralModal } from "@/components/GeneralModal";

export default function TypeUserEditPage({
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

  const handleSubmit = async (data: TypeUserSchema) => {
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
  ): Partial<TypeUserSchema> => ({
    nombre: data.nombre,
  });

  if (!typeUser) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={TypeUserTitle}
      subtitle={TypeUserDescriptionEdit}
      maxWidth="max-w-(--breakpoint-lg)"
    >
      {isFinding ? (
        <FormSkeleton />
      ) : (
        <TypeUserForm
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
