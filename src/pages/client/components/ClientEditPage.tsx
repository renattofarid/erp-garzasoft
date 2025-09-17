"use client";

import { errorToast, successToast } from "@/lib/core.function";
import { ClientSchema } from "../lib/client.schema.ts";
import {
  ClientIconName,
  ClientResource,
  ClientRoute,
  ClientTitle,
} from "../lib/client.interface.ts";
import NotFound from "@/components/not-found";
import { ClientForm } from "./ClientForm.tsx";
import { useClientStore } from "../lib/client.store.ts";
import { useClient } from "../lib/client.hook.ts";
import { useNavigate, useParams } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent.tsx";
import FormSkeleton from "@/components/FormSkeleton.tsx";

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();

  if (!id || isNaN(Number(id))) {
    return <NotFound />;
  }

  const { data: client, isFinding } = useClient(Number(id));
  const { isSubmitting, updateClient } = useClientStore();

  const handleSubmit = async (data: ClientSchema) => {
    await updateClient(Number(id), data)
      .then(() => {
        successToast("Tipo de Usuario actualizado exitosamente");
        router(ClientRoute);
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el Tipo de Usuario");
      });
  };

  const mapClientToForm = (data: ClientResource): Partial<ClientSchema> => ({
    sucursales:
      data.sucursales_clientes.length > 0
        ? data.sucursales_clientes.map((sucursal) => ({
            nombre: sucursal.nombre,
          }))
        : [{ nombre: "" }],
    contactos: data.contactos_clientes.map((contacto) => ({
      nombre: contacto.nombre,
      celular: contacto.celular,
      email: contacto.email,
    })),
    tipo: data.tipo,
    ruc: data.ruc,
    razon_social: data.razon_social,
    dueno_nombre: data.dueno_nombre,
    dueno_celular: data.dueno_celular,
    dueno_email: data.dueno_email,
    representante_nombre: data.representante_nombre,
    representante_celular: data.representante_celular,
    representante_email: data.representante_email,
  });

  if (isFinding) return <FormSkeleton />;

  if (!client) return <NotFound />;

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
      <TitleFormComponent
        title={ClientTitle}
        mode="edit"
        icon={ClientIconName}
      />
      <ClientForm
        defaultValues={mapClientToForm(client)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="update"
        onCancel={() => router(ClientRoute)}
      />
    </div>
  );
}
