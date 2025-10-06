"use client";

import { errorToast, successToast } from "@/lib/core.function";

import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";

import { GeneralModal } from "@/components/GeneralModal";
import { useUser, useUsers } from "../lib/User.hook";
import { useUserStore } from "../lib/Users.store";
import { UserSchema } from "../lib/User.schema";
import {
  UserDescriptionEdit,
  UserResource,
  UserTitle,
} from "../lib/User.interface";
import { UserForm } from "./UserForm";

export default function UserEditPage({
  id,
  open,
  setOpen,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!id) return <NotFound />;

  const { data: User, isFinding } = useUser(id);
  const { refetch } = useUsers();
  const { isSubmitting, updateUser } = useUserStore();

  const handleSubmit = async (data: UserSchema) => {
    await updateUser(id, data)
      .then(() => {
        setOpen(false);
        successToast("Usuario actualizado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el Usuario");
      });
  };

  const mapUserToForm = (data: UserResource): Partial<UserSchema> => ({
    nombres: data.nombres,
    apellidos: data.apellidos,
    usuario: data.usuario,
    tipo_usuario_id: data.tipo_usuario_id.toString(),
    password: data.password,
  });

  if (!isFinding && !User) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={UserTitle}
      subtitle={UserDescriptionEdit}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {isFinding || !User ? (
        <FormSkeleton />
      ) : (
        <UserForm
          defaultValues={mapUserToForm(User)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />
      )}
    </GeneralModal>
  );
}
