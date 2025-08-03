import { useNavigate } from "react-router-dom";
import { TypeUserSchema } from "../lib/typeUser.schema";
import {
  TypeUserIconName,
  TypeUserRoute,
  TypeUserTitle,
} from "../lib/typeUser.interface";
import { errorToast, successToast } from "@/lib/core.function";
import TitleFormComponent from "@/components/TitleFormComponent";
import { TypeUserForm } from "./TypeUserForm";
import { useTypeUserStore } from "../lib/typeUsers.store";

export default function TypeUserAddPage() {
  const router = useNavigate();
  const { isSubmitting, createTypeUser } = useTypeUserStore();

  const handleSubmit = async (data: TypeUserSchema) => {
    try {
      await createTypeUser(data);
      successToast("Tipo de Usuario creado exitosamente");
      router(TypeUserRoute);
    } catch {
      errorToast("Hubo un error al crear el Tipo de Usuario");
    }
  };

  return (
    <div className="max-w-(--breakpoint-md) w-full mx-auto p-4 space-y-6">
      <TitleFormComponent
        title={TypeUserTitle}
        mode="create"
        icon={TypeUserIconName}
      />
      <TypeUserForm
        defaultValues={{ nombre: "" }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
      />
    </div>
  );
}
