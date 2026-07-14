"use client";

import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import { GeneralModal } from "@/components/GeneralModal";
import { errorToast, successToast } from "@/lib/core.function";
import { useLocalType, useLocalTypes } from "../lib/localType.hook";
import { useLocalTypeStore } from "../lib/localTypes.store";
import {
  LocalTypeDescriptionEdit,
  LocalTypeResource,
  LocalTypeTitle,
} from "../lib/localType.interface";
import { LocalTypeSchema } from "../lib/localType.schema";
import { LocalTypeForm } from "./LocalTypeForm";

export default function LocalTypeEditPage({
  id,
  open,
  setOpen,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!id) return <NotFound />;

  const { data: localType, isFinding } = useLocalType(id);
  const { refetch } = useLocalTypes();
  const { isSubmitting, updateLocalType } = useLocalTypeStore();

  const handleSubmit = async (data: LocalTypeSchema) => {
    await updateLocalType(id, data)
      .then(() => {
        setOpen(false);
        successToast("Tipo de local actualizado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el tipo de local");
      });
  };

  const mapLocalTypeToForm = (
    data: LocalTypeResource
  ): Partial<LocalTypeSchema> => ({
    nombre: data.nombre,
  });

  if (!localType) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={LocalTypeTitle}
      subtitle={LocalTypeDescriptionEdit}
      maxWidth="max-w-(--breakpoint-lg)"
    >
      {isFinding ? (
        <FormSkeleton />
      ) : (
        <LocalTypeForm
          defaultValues={mapLocalTypeToForm(localType)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />
      )}
    </GeneralModal>
  );
}
