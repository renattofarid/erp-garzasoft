"use client";

import { useNavigate, useParams } from "react-router-dom";
import { errorToast, successToast } from "@/lib/core.function";
import { TypeUserSchema } from "../lib/typeUser.schema";
import {
  TypeUserIconName,
  TypeUserResource,
  TypeUserRoute,
  TypeUserTitle,
} from "../lib/typeUser.interface";
import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import TitleFormComponent from "@/components/TitleFormComponent";
import { TypeUserForm } from "./TypeUserForm";
import { useTypeUserStore } from "../lib/typeUsers.store";
import { useTypeUser } from "../lib/typeUser.hook";

export default function TypeUserEditPage() {
  const { id } = useParams();
  const router = useNavigate();

  if (!id) return <NotFound />;

  const { data: typeUser, isLoading } = useTypeUser(id);
  const { isSubmitting, updateTypeUser } = useTypeUserStore();

  const handleSubmit = async (data: TypeUserSchema) => {
    try {
      await updateTypeUser(id, data);
      successToast("Tipo de Usuario actualizado exitosamente");
      router(TypeUserRoute);
    } catch {
      errorToast("Hubo un error al actualizar el Tipo de Usuario");
    }
  };

  const mapTypeUserToForm = (
    data: TypeUserResource
  ): Partial<TypeUserSchema> => ({
    nombre: data.nombre,
  });

  if (isLoading) return <FormSkeleton />;
  if (!typeUser) return <NotFound />;

  return (
    <div className="max-w-(--breakpoint-md) w-full mx-auto p-4 space-y-6">
      <TitleFormComponent
        title={TypeUserTitle}
        mode="edit"
        icon={TypeUserIconName}
      />
      <TypeUserForm
        defaultValues={mapTypeUserToForm(typeUser)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="update"
      />
    </div>
  );
}
