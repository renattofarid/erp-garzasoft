import { useEffect, useState, type ReactNode } from "react";
import { Control, useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Calculator, CheckCircle2, ExternalLink, FileText, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelect } from "@/components/FormSelect";
import { Matcher } from "react-day-picker";
import { format, parse, parseISO } from "date-fns";
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
import {
  getActiveContractsByClient,
  openContractPdf,
} from "../lib/contract.actions";
import type { ContractResource } from "../lib/contract.interface";
import { errorToast } from "@/lib/core.function";

interface ContractBasicInfoProps {
  control: Control<any>;
  clients: ClientResource[];
  fechaInicio: string;
  vigenciaContrato: string;
  duracionAnios: number;
  contractType: string;
  currentContractId?: number;
  installmentsTotal: number;
  hasInstallments: boolean;
  onRecalculateTotal: () => void;
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
  duracionAnios: _duracionAnios,
  contractType,
  currentContractId,
  installmentsTotal,
  hasInstallments,
  onRecalculateTotal,
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
  const periodicidadCuota = useWatch({
    control,
    name: "periodicidad_cuota",
  }) as string | undefined;
  const [activeContracts, setActiveContracts] = useState<ContractResource[]>([]);
  const [isCheckingContracts, setIsCheckingContracts] = useState(false);
  const [contractsCheckFailed, setContractsCheckFailed] = useState(false);
  const [checkedClientId, setCheckedClientId] = useState<number>();

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

  useEffect(() => {
    let cancelled = false;

    if (!currentClientId) {
      setActiveContracts([]);
      setContractsCheckFailed(false);
      setCheckedClientId(undefined);
      return () => {
        cancelled = true;
      };
    }

    setIsCheckingContracts(true);
    setContractsCheckFailed(false);
    getActiveContractsByClient(currentClientId, currentContractId)
      .then((response) => {
        if (!cancelled) {
          setActiveContracts(response.data);
          setCheckedClientId(currentClientId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActiveContracts([]);
          setContractsCheckFailed(true);
          setCheckedClientId(currentClientId);
        }
      })
      .finally(() => {
        if (!cancelled) setIsCheckingContracts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentClientId, currentContractId]);

  const formatContractDate = (value: string) => {
    try {
      return format(parseISO(value), "dd/MM/yyyy");
    } catch {
      return value;
    }
  };

  const isContractStatusPending =
    Boolean(currentClientId) &&
    (isCheckingContracts || checkedClientId !== currentClientId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Información del Contrato</h2>
          <p className="text-sm text-muted-foreground">
            Datos básicos y cliente final
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 rounded-xl border bg-modal/70 p-6 shadow-xs md:grid-cols-2">
        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Número de Contrato</RequiredLabel>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={`CT-${new Date().getFullYear()}-001`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSelect
          control={control}
          label="Cliente (Empresa / Corporación)"
          name="cliente_padre_id"
          placeholder="Selecciona una corporación, empresa o local"
          options={rootOptions.map((client) => ({
            label: getClientDisplayName(client),
            value: client.id.toString(),
            keywords: client.ruc ? [client.ruc] : undefined,
          }))}
          onChange={syncParentAndClient}
        />

        <FormSelect
          control={control}
          label="Local / Sucursal Final"
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
            keywords: client.ruc ? [client.ruc] : undefined,
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

        {isContractStatusPending && (
          <div className="md:col-span-2 flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Verificando contratos vigentes del local...
          </div>
        )}

        {!isContractStatusPending && activeContracts.length > 0 && (
          <Alert className="md:col-span-2 border-amber-400/70 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle />
            <AlertTitle>
              Este local ya tiene {activeContracts.length} contrato{activeContracts.length !== 1 ? "s" : ""} vigente{activeContracts.length !== 1 ? "s" : ""}
            </AlertTitle>
            <AlertDescription className="mt-2 w-full text-amber-900 dark:text-amber-200">
              <p>Revísalo antes de registrar otro contrato para evitar duplicados.</p>
              <div className="mt-2 grid w-full gap-2">
                {activeContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex flex-col gap-2 rounded-md border border-amber-300/70 bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800"
                  >
                    <div>
                      <p className="font-semibold">{contract.numero}</p>
                      <p className="text-xs">
                        Vigente del {formatContractDate(contract.fecha_inicio)} al {formatContractDate(contract.fecha_fin)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        openContractPdf(contract.id).catch(() =>
                          errorToast("No se pudo abrir el PDF del contrato.")
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver PDF
                    </Button>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!isContractStatusPending && contractsCheckFailed && (
          <Alert variant="destructive" className="md:col-span-2">
            <AlertTriangle />
            <AlertTitle>No se pudo verificar si existen contratos vigentes</AlertTitle>
            <AlertDescription>
              Puedes continuar, pero revisa el listado de contratos antes de guardar.
            </AlertDescription>
          </Alert>
        )}

        {!isContractStatusPending &&
          currentClientId &&
          !contractsCheckFailed &&
          activeContracts.length === 0 && (
            <Alert className="md:col-span-2 border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
              <CheckCircle2 />
              <AlertTitle>Local disponible</AlertTitle>
              <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                No se encontraron contratos vigentes para este local.
              </AlertDescription>
            </Alert>
          )}

        <FormSelect
          control={control}
          label="Vigencia del Contrato"
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
                  <RequiredLabel>Cantidad de Años</RequiredLabel>
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
          label="Fecha de Finalización"
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
          label="Forma de Cobro"
          name="forma_pago"
          placeholder="Selecciona una forma de cobro"
          options={[
            { label: "Pago Parcial (Cuotas)", value: "parcial" },
            { label: "Pago Único", value: "unico" },
          ]}
        />

        <FormSelect
          control={control}
          label="Tipo de Pago"
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

        {periodicidadCuota === "mensual" && (
          <FormField
            control={control}
            name="costo_instalacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de Instalación (S/.)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                      S/.
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="100.00"
                      value={field.value ?? 100}
                      className="pl-10 font-semibold"
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === "" ? 0 : Number(event.target.value)
                        )
                      }
                    />
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Cobro adelantado de instalación (si las cuotas son a fin de mes, se programa al inicio)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="total"
          render={({ field }) => (
            <FormItem className="md:col-start-1">
              <FormLabel>Precio Total (S/.)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
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

        <div className="flex flex-col justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={!hasInstallments}
            onClick={onRecalculateTotal}
          >
            <Calculator className="h-4 w-4" />
            Recalcular total desde cuotas
          </Button>
          <p className="text-xs text-muted-foreground">
            Suma actual de cuotas: S/. {installmentsTotal.toFixed(2)}
          </p>
        </div>
      </div>

    
    </div>
  );
};
