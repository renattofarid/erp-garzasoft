import { UserSchema } from "../lib/User.schema";
import { errorToast, successToast } from "@/lib/core.function";

import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../lib/Users.store";
import { useUsers } from "../lib/User.hook";
import { UserTitle } from "../lib/User.interface";
import { UserForm } from "./UserForm";

export default function UserAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createUser } = useUserStore();
  const { refetch } = useUsers();

  const handleSubmit = async (data: UserSchema) => {
    await createUser(data)
      .then(() => {
        setOpen(false);
        successToast("Usuario creado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al crear el Usuario");
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
        title={"Agregar " + UserTitle}
        maxWidth="!max-w-(--breakpoint-lg)"
      >
        <UserForm
          defaultValues={{ usuario: "" }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={() => setOpen(false)}
        />
      </GeneralModal>
    </>
  );
}
