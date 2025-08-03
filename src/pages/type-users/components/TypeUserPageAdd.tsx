"use client";

import TitleFormComponent from "@/components/TitleFormComponent";
import { useNavigate } from "react-router-dom";
import { TypeUserSchema } from "../lib/typeUser.schema";
import { TypeUserForm } from "./TypeUserForm";
import {
  TypeUserIconName,
  TypeUserRouter,
  TypeUserTitle,
} from "../lib/typeUser.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { storeTypeUser } from "../lib/typeUser.actions";

export default function CreateTypeUserPage() {
  const router = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: storeTypeUser,
    onSuccess: () => {
      successToast("Tipo de Usuario creado exitosamente");
      router(TypeUserRouter);
    },
    onError: () => {
      errorToast("Hubo un error al crear el Tipo de Usuario");
    },
  });

  const handleSubmit = (data: TypeUserSchema) => {
    mutate(data);
  };

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto p-4 space-y-6">
      <TitleFormComponent
        title={TypeUserTitle}
        mode="create"
        icon={TypeUserIconName}
      />
      <TypeUserForm
        defaultValues={{
          nombre: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </div>
  );
}
