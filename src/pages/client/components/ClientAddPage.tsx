import { ClientSchema } from "../lib/client.schema.ts";
import { TypeUserTitle } from "../lib/client.interface.ts";
import { errorToast, successToast } from "@/lib/core.function";
import { ClientForm } from "./ClientForm.tsx";
import { useTypeUserStore } from "../lib/client.store.ts";
import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTypeUsers } from "../lib/client.hook.ts";

export default function ClientAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createTypeUser } = useTypeUserStore();
  const { refetch } = useTypeUsers();

  const handleSubmit = async (data: ClientSchema) => {
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
        <ClientForm
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
