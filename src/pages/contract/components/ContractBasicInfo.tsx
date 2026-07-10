import { useEffect, type ReactNode } from "react";
import { Control, useFormContext, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelect } from "@/components/FormSelect";
import { Matcher } from "react-day-picker";
import { parse } from "date-fns";
import { getClientDisplayName, type ClientResource } from "@/pages/client/lib/client.interface";
import { findClientById, findRootClientById, getClientHierarchyLabel, getLeafClients } from "../lib/contract.tree";

interface ContractBasicInfoProps {
  control: Control<any>;
  clients: ClientResource[];
  fechaInicio: string;
}

const RequiredMark = () => <span className="ml-1 text-red-500">*</span>;

const RequiredLabel = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <RequiredMark />
  </>
);

export const ContractBasicInfo = ({
  control,
  clients,
  fechaInicio,
}: ContractBasicInfoProps) => {
  const { setValue } = useFormContext();
  const selectedClientId = useWatch({ control, name: "cliente_id" }) as number | string | undefined;
  const selectedParentId = useWatch({ control, name: "cliente_padre_id" }) as number | string | undefined;

  const currentClientId = Number(selectedClientId) || undefined;
  const currentParentId = Number(selectedParentId) || undefined;

  const selectedParentClient =
    findClientById(clients, currentParentId) ||
    findRootClientById(clients, currentClientId);

  const leafClients = selectedParentClient ? getLeafClients(selectedParentClient) : [];
  const localOptions = leafClients.length > 0 ? leafClients : selectedParentClient ? [selectedParentClient] : [];

  const rootOptions = clients;

  const syncParentAndClient = (parentId: string) => {
    const nextParentId = Number(parentId);
    const nextParent = findClientById(clients, nextParentId);
    if (!nextParent) return;

    const nextLeaves = getLeafClients(nextParent);
    const preservedClient = nextLeaves.find((client) => client.id === currentClientId);
    const nextClient = preservedClient ?? (nextLeaves.length === 1 ? nextLeaves[0] : null);

    setValue("cliente_padre_id", nextParent.id, { shouldDirty: true, shouldValidate: true });
    setValue("cliente_id", nextClient?.id ?? undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const syncClient = (clientId: string) => {
    const nextClientId = Number(clientId);
    const nextClient = findClientById(clients, nextClientId);
    if (!nextClient) return;

    const rootParent = findRootClientById(clients, nextClientId) ?? nextClient;
    setValue("cliente_padre_id", rootParent.id, { shouldDirty: true, shouldValidate: true });
    setValue("cliente_id", nextClient.id, { shouldDirty: true, shouldValidate: true });
  };

  useEffect(() => {
    if (!currentClientId || clients.length === 0) return;

    const rootClient = findRootClientById(clients, currentClientId);
    if (rootClient && currentParentId !== rootClient.id) {
      setValue("cliente_padre_id", rootClient.id, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [clients, currentClientId, currentParentId, setValue]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Información del Contrato</h2>
          <p className="text-sm text-muted-foreground">Datos básicos y cliente final</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-modal border rounded-lg shadow-sm">
        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Número de Contrato</RequiredLabel>
              </FormLabel>
              <FormControl>
                <Input placeholder="CT-2025-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSelect
          control={control}
          label="Cliente"
          name="cliente_padre_id"
          placeholder="Selecciona una corporación, empresa o local"
          options={rootOptions.map((client) => ({
            label: getClientDisplayName(client),
            value: client.id.toString(),
          }))}
          onChange={syncParentAndClient}
        />

        <FormSelect
          control={control}
          label="Local"
          name="cliente_id"
          placeholder={
            selectedParentClient
              ? localOptions.length > 0
                ? "Selecciona el local"
                : "Este cliente no tiene locales"
              : "Primero selecciona un cliente"
          }
          options={localOptions.map((client) => ({
            label: getClientHierarchyLabel(clients, client.id),
            value: client.id.toString(),
          }))}
          onChange={syncClient}
        />

        <DatePickerFormField
          control={control}
          name="fecha_inicio"
          captionLayout="dropdown"
          dateFormat="dd/MM/yyyy"
          label="Fecha de Inicio"
          placeholder="Selecciona una fecha"
        />

        <DatePickerFormField
          control={control}
          name="fecha_fin"
          captionLayout="dropdown"
          dateFormat="dd/MM/yyyy"
          label="Fecha de Finalización"
          placeholder="Selecciona una fecha"
          disabledRange={
            {
              before: fechaInicio
                ? new Date(
                    parse(fechaInicio, "yyyy-MM-dd", new Date()).getTime() +
                      24 * 60 * 60 * 1000
                  )
                : undefined,
            } as Matcher
          }
        />

        <FormSelect
          control={control}
          label="Tipo de Contrato"
          name="tipo_contrato"
          placeholder="Selecciona un tipo"
          options={[
            { label: "Desarrollo a Medida", value: "desarrollo" },
            { label: "SaaS", value: "saas" },
            { label: "Soporte", value: "soporte" },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        El contrato se asigna al local final seleccionado. Si el cliente elegido no tiene hijos, se usará ese mismo registro.
      </div>
    </div>
  );
};
