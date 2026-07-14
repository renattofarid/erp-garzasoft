"use client";

import { errorToast, successToast } from "@/lib/core.function";
import { ClientSchema } from "../lib/client.schema.ts";
import {
  ClientIconName,
  ClientFormNode,
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
import { normalizeNodeType } from "../lib/client.schema.ts";
import { useMemo } from "react";

const normalizeContact = (contact?: {
  dni?: string | null;
  nombre?: string | null;
  celular?: string | null;
  email?: string | null;
}) => ({
  dni: contact?.dni ?? "",
  nombre: contact?.nombre ?? "",
  celular: contact?.celular ?? "",
  email: contact?.email ?? "",
});

const sameContact = (
  left?: ReturnType<typeof normalizeContact> | null,
  right?: ReturnType<typeof normalizeContact> | null
) =>
  !!left &&
  !!right &&
  left.dni === right.dni &&
  left.nombre === right.nombre &&
  left.celular === right.celular &&
  left.email === right.email;

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();
  const numericId = Number(id ?? 0);
  const isValidId = Number.isFinite(numericId) && numericId > 0;
  const { data: client, isFinding } = useClient(isValidId ? numericId : 0);
  const { isSubmitting, updateClient } = useClientStore();

  if (!isValidId) {
    return <NotFound />;
  }

  const handleSubmit = async (data: ClientSchema) => {
    await updateClient(numericId, data)
      .then(() => {
        successToast("Cliente actualizado exitosamente");
        router(ClientRoute);
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el cliente");
      });
  };

  const mapClientToForm = (
    data: ClientResource,
    parentMainContact?: ReturnType<typeof normalizeContact> | null
  ): ClientFormNode => {
    const contactos = data.contactos_clientes.map((contacto) =>
      normalizeContact(contacto)
    );
    const contactoPrincipal =
      contactos[0] ??
      normalizeContact({
        dni: null,
        nombre: data.dueno_nombre,
        celular: data.dueno_celular,
        email: data.dueno_email,
      });
    const contactoIgualEmpresa =
      Boolean(data.contacto_igual_empresa) ||
      (data.tipo_ui === "local" && sameContact(contactoPrincipal, parentMainContact));

    return {
      id: String(data.id),
      tipo: normalizeNodeType(data.tipo_ui ?? data.tipo),
      ruc: data.ruc ?? "",
      razon_social: data.razon_social ?? "",
      nombre_comercial: data.nombre_comercial ?? "",
      direccion: data.direccion ?? "",
      tipos_local: data.tipos_local ?? [],
      contacto: contactoPrincipal,
      contactos:
        contactos.length > 0
          ? contactos
          : [
              {
                dni: "",
                nombre: data.dueno_nombre ?? "",
                celular: data.dueno_celular ?? "",
                email: data.dueno_email ?? "",
              },
            ],
      contacto_igual_empresa: contactoIgualEmpresa,
      hijos: (data.hijos_clientes ?? []).map((child) =>
        mapClientToForm(child, contactoPrincipal)
      ),
    };
  };

  const defaultValues = useMemo(() => (client ? mapClientToForm(client) : null), [client]);

  if (isFinding) return <FormSkeleton />;

  if (!client || !defaultValues) return <NotFound />;

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
      <TitleFormComponent
        title={ClientTitle}
        mode="edit"
        icon={ClientIconName}
      />
      <ClientForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="update"
        onCancel={() => router(ClientRoute)}
      />
    </div>
  );
}
