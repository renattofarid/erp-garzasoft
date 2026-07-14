import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import { errorToast, successToast } from "@/lib/core.function";
import { useLocalTypeStore } from "../lib/localTypes.store";
import { useLocalTypes } from "../lib/localType.hook";
import {
  LocalTypeDescriptionAdd,
  LocalTypeTitle,
} from "../lib/localType.interface";
import { LocalTypeSchema } from "../lib/localType.schema";
import { LocalTypeForm } from "./LocalTypeForm";

export default function LocalTypeAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createLocalType } = useLocalTypeStore();
  const { refetch } = useLocalTypes();

  const handleSubmit = async (data: LocalTypeSchema) => {
    await createLocalType(data)
      .then(() => {
        setOpen(false);
        successToast("Tipo de local creado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al crear el tipo de local");
      });
  };

  return (
    <>
      <Button
        size="sm"
        className="ml-auto !px-10"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar
      </Button>
      <GeneralModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={LocalTypeTitle}
        subtitle={LocalTypeDescriptionAdd}
        maxWidth="!max-w-(--breakpoint-sm)"
      >
        <LocalTypeForm
          defaultValues={{ nombre: "" }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={() => setOpen(false)}
        />
      </GeneralModal>
    </>
  );
}
