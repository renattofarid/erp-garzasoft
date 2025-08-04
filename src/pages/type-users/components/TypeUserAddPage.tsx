import { TypeUserSchema } from "../lib/typeUser.schema";
import { TypeUserTitle } from "../lib/typeUser.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { TypeUserForm } from "./TypeUserForm";
import { useTypeUserStore } from "../lib/typeUsers.store";
import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTypeUsers } from "../lib/typeUser.hook";

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
      <Button size="sm" className="ml-auto px-10" onClick={() => setOpen(true)}>
        Agregar
      </Button>
      <GeneralModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={"Agregar " + TypeUserTitle}
        maxWidth="max-w-(--breakpoint-lg)"
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
