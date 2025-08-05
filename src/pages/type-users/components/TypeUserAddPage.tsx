import { TypeUserSchema } from "../lib/typeUser.schema";
import {
  TypeUserDescriptionAdd,
  TypeUserTitle,
} from "../lib/typeUser.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { TypeUserForm } from "./TypeUserForm";
import { useTypeUserStore } from "../lib/typeUsers.store";
import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTypeUsers } from "../lib/typeUser.hook";
import { Plus } from "lucide-react";

export default function TypeUserAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createTypeUser } = useTypeUserStore();
  const { refetch } = useTypeUsers();

  const handleSubmit = async (data: TypeUserSchema) => {
    await createTypeUser(data)
      .then(() => {
        setOpen(false);
        successToast("Tipo de Usuario creado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al crear el Tipo de Usuario");
      });
  };

  return (
    <>
      <Button
        size="sm"
        className="ml-auto !px-10"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar Agregar
      </Button>
      <GeneralModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={TypeUserTitle}
        subtitle={TypeUserDescriptionAdd}
        maxWidth="!max-w-(--breakpoint-sm)"
      >
        <TypeUserForm
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
