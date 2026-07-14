import { useEffect, type ReactNode } from "react";
import { Control, useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelect } from "@/components/FormSelect";
import { Matcher } from "react-day-picker";
import { parse } from "date-fns";
import {
  getClientDisplayName,
  type ClientResource,
} from "@/pages/client/lib/client.interface";
import {
  findClientById,
  findRootClientById,
  getClientHierarchyLabel,
  getLeafClients,
} from "../lib/contract.tree";

interface ContractBasicInfoProps {
  control: Control<any>;
  clients: ClientResource[];
  fechaInicio: string;
  vigenciaContrato: string;
  duracionAnios: number;
  contractType: string;
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
  vigenciaContrato,
  duracionAnios,
  contractType,
}: ContractBasicInfoProps) => {
  const { setValue } = useFormContext();
  const selectedClientId = useWatch({
    control,
    name: "cliente_id",
  }) as number | string | undefined;
  const selectedParentId = useWatch({
    control,
    name: "cliente_padre_id",
  }) as number | string | undefined;

  const currentClientId = Number(selectedClientId) || undefined;
  const currentParentId = Number(selectedParentId) || undefined;

  const selectedParentClient =
    findClientById(clients, currentParentId) ||
    findRootClientById(clients, currentClientId);

  const leafClients = selectedParentClient
    ? getLeafClients(selectedParentClient)
    : [];
  const localOptions =
    leafClients.length > 0
      ? leafClients
      : selectedParentClient
      ? [selectedParentClient]
      : [];

  const rootOptions = clients;

  const syncParentAndClient = (parentId: string) => {
    const nextParentId = Number(parentId);
    const nextParent = findClientById(clients, nextParentId);
    if (!nextParent) return;

    const nextLeaves = getLeafClients(nextParent);
    const preservedClient = nextLeaves.find(
      (client) => client.id === currentClientId
    );
    const nextClient =
      preservedClient ?? (nextLeaves.length === 1 ? nextLeaves[0] : null);

    setValue("cliente_padre_id", nextParent.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
    setValue("cliente_padre_id", rootParent.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("cliente_id", nextClient.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
        <div className="rounded-lg bg-primary/10 p-2">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Informacion del Contrato</h2>
          <p className="text-sm text-muted-foreground">
            Datos basicos y cliente final
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-modal p-6 shadow-sm md:grid-cols-2">
        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Numero de Contrato</RequiredLabel>
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
          placeholder="Selecciona una corporacion, empresa o local"
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

        <FormSelect
          control={control}
          label="Vigencia del contrato"
          name="vigencia_contrato"
          placeholder="Selecciona una vigencia"
          options={[
            { label: "Semestral", value: "semestral" },
            { label: "Anual", value: "anual" },
          ]}
        />

        {vigenciaContrato === "anual" && (
          <FormField
            control={control}
            name="duracion_anios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabel>Cantidad de años</RequiredLabel>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={field.value ?? 1}
                    onChange={(event) =>
                      field.onChange(Math.max(1, Number(event.target.value) || 1))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DatePickerFormField
          control={control}
          name="fecha_fin"
          captionLayout="dropdown"
          dateFormat="dd/MM/yyyy"
          label="Fecha de Finalizacion"
          placeholder="Selecciona una fecha"
          disabledRange={
            {
              before: fechaInicio
                ? new Date(parse(fechaInicio, "yyyy-MM-dd", new Date()).getTime())
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

        <FormSelect
          control={control}
          label="Forma de cobro"
          name="forma_pago"
          placeholder="Selecciona una forma de pago"
          options={[
            { label: "Pago Parcial (Cuotas)", value: "parcial" },
            { label: "Pago Unico", value: "unico" },
          ]}
        />

        <FormSelect
          control={control}
          label="Tipo de pago"
          name="periodicidad_cuota"
          placeholder="Selecciona un tipo"
          options={
            vigenciaContrato === "semestral"
              ? [{ label: "Mensual", value: "mensual" }]
              : [
                  { label: "Mensual", value: "mensual" },
                  { label: "Anual", value: "anual" },
                ]
          }
        />

        <FormField
          control={control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Total</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    S/.
                  </span>
                  <Input
                    type="number"
                    value={field.value ?? 0}
                    disabled={contractType === "saas"}
                    className="pl-10 font-semibold text-right"
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        El contrato se asigna al local final seleccionado. Si el cliente
        elegido no tiene hijos, se usara ese mismo registro. La vigencia{" "}
        {vigenciaContrato === "semestral"
          ? "semestral"
          : `anual de ${duracionAnios || 1} año(s)`}{" "}
        propone la fecha
        de finalizacion automaticamente, pero puedes cambiarla manualmente.
      </div>
    </div>
  );
};
