"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Control, Path, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { errorToast, successToast } from "@/lib/core.function";
import axios from "axios";
import { lookupClientByDni, lookupClientByRuc } from "../lib/client.actions";
import {
  ClientFormNode,
  LocalKind,
  ClientTypeUi,
  createEmptyClientNode,
} from "../lib/client.interface";
import {
  ClientSchema,
  clientSchemaCreate,
  clientSchemaUpdate,
} from "../lib/client.schema";
import { Building2, Loader2, Plus, Search, Trash2, UsersRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getAllLocalTypes } from "@/pages/local-types/lib/localType.actions";
import { LocalTypeResource } from "@/pages/local-types/lib/localType.interface";

interface ClientFormProps {
  defaultValues: Partial<ClientSchema>;
  onSubmit: (data: ClientSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

const joinPath = (basePath: string, field: string) =>
  basePath ? `${basePath}.${field}` : field;

const getParentNodePath = (basePath: string) =>
  basePath.replace(/(?:^|\.)hijos\.\d+$/, "").replace(/\.$/, "");

const emptyContact = {
  dni: "",
  nombre: "",
  celular: "",
  email: "",
  es_dueno: false,
  es_vendedor: false,
};

const RequiredMark = () => <span className="ml-1 text-red-500">*</span>;

const RequiredLabel = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <RequiredMark />
  </>
);

const cloneNode = (node: Partial<ClientFormNode>, isRoot = false): ClientFormNode => ({
  ...createEmptyClientNode(node.tipo ?? "local"),
  ...node,
  contacto: {
    ...emptyContact,
    ...node.contacto,
  },
  contacto_igual_empresa: node.contacto_igual_empresa ?? false,
  contactos: isRoot
    ? node.contactos && node.contactos.length > 0
      ? node.contactos.map((contacto) => ({
          ...emptyContact,
          ...contacto,
        }))
      : [
          {
            ...emptyContact,
            ...node.contacto,
          },
        ]
    : [],
  hijos: node.hijos?.map((child) => cloneNode(child, false)) ?? [],
});

const stripNode = (node: ClientFormNode, isRoot = false): ClientSchema => {
  const contactos = node.contactos?.length ? node.contactos : [node.contacto];
  const normalizedContacts = contactos.map((contacto) => ({
    dni: contacto?.dni ?? "",
    nombre: contacto?.nombre ?? "",
    celular: contacto?.celular ?? "",
    email: contacto?.email ?? "",
    es_dueno: contacto?.es_dueno ?? false,
    es_vendedor: contacto?.es_vendedor ?? false,
  }));
  const contactoPrincipal = normalizedContacts[0] ?? {
    dni: "",
    nombre: "",
    celular: "",
    email: "",
    es_dueno: false,
    es_vendedor: false,
  };

  return {
    tipo: node.tipo,
    ruc: node.ruc,
    razon_social: node.razon_social,
    nombre_comercial: node.nombre_comercial,
    direccion: node.direccion,
    tipos_local: node.tipos_local ?? [],
    contacto: contactoPrincipal,
    contactos: isRoot ? normalizedContacts : [],
    contacto_igual_empresa: node.contacto_igual_empresa ?? false,
    hijos: (node.hijos ?? []).map((child) => stripNode(child, false)),
  };
};

function ClientNodeSection({
  control,
  basePath,
  title,
  onLookupRuc,
  onLookupDni,
  localTypeOptions,
  lookupLoadingPath,
}: {
  control: Control<any>;
  basePath: string;
  title: string;
  onLookupRuc: (path: string) => Promise<void>;
  onLookupDni: (path: string) => Promise<void>;
  localTypeOptions: LocalTypeResource[];
  lookupLoadingPath?: string | null;
}) {
  const { setValue } = useFormContext<ClientSchema>();
  const tipo = useWatch({
    control,
    name: joinPath(basePath, "tipo") as Path<any>,
  }) as ClientTypeUi | undefined;
  const sameCompanyContactPath = joinPath(basePath, "contacto_igual_empresa");
  const localTypesPath = joinPath(basePath, "tipos_local");
  const sameCompanyContact = useWatch({
    control,
    name: sameCompanyContactPath as Path<any>,
  }) as boolean | undefined;
  const selectedLocalTypes = useWatch({
    control,
    name: localTypesPath as Path<any>,
  }) as LocalKind[] | undefined;

  const childTypes: ClientTypeUi[] =
    tipo === "corporacion" ? ["empresa"] : tipo === "empresa" ? ["local"] : [];

  const children = useFieldArray({
    control,
    name: joinPath(basePath, "hijos") as any,
  });
  const contacts = useFieldArray({
    control,
    name: joinPath(basePath, "contactos") as any,
  });

  const addChild = (childType: ClientTypeUi) => {
    children.append({
      ...createEmptyClientNode(childType),
      contactos: [],
    });
  };

  const addContact = () => {
    contacts.append({ ...emptyContact });
  };

  const isRoot = basePath === "";
  const isCorporacion = tipo === "corporacion";
  const isEmpresa = tipo === "empresa";
  const isLocal = tipo === "local";
  const rucPath = joinPath(basePath, "ruc");
  const dniPath = joinPath(joinPath(basePath, "contacto"), "dni");
  const allowMultipleContacts = isRoot;
  const showSameCompanyContact = isLocal && !isRoot;
  const parentPath = getParentNodePath(basePath);
  const parentSingleContact = useWatch({
    control,
    name: joinPath(parentPath, "contacto") as Path<any>,
  });
  const parentMainContact = useWatch({
    control,
    name: joinPath(parentPath, "contactos.0") as Path<any>,
  });
  const companyContact =
    parentMainContact?.nombre || parentMainContact?.dni
      ? parentMainContact
      : parentSingleContact;

  const syncCompanyContact = (checked: boolean) => {
    setValue(sameCompanyContactPath as Path<ClientSchema>, checked as any, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!checked) {
      return;
    }

    const targetPath = joinPath(basePath, "contacto");
    const contactToCopy = {
      dni: companyContact?.dni ?? "",
      nombre: companyContact?.nombre ?? "",
      celular: companyContact?.celular ?? "",
      email: companyContact?.email ?? "",
      es_dueno: companyContact?.es_dueno ?? false,
      es_vendedor: companyContact?.es_vendedor ?? false,
    };

    setValue(targetPath as Path<ClientSchema>, contactToCopy as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border bg-sidebar p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label className="font-semibold text-base">{title}</Label>
          <p className="text-sm text-muted-foreground">
            {isCorporacion
              ? "La corporación agrupa empresas."
              : isEmpresa
              ? "La empresa agrupa locales."
              : "El local es el punto final de atención."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isRoot && (
          <FormField
            control={control}
            name={"tipo" as Path<any>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabel>Tipo de cliente</RequiredLabel>
                </FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...field}
                  >
                    <option value="">Seleccionar</option>
                    <option value="corporacion">Corporación</option>
                    <option value="empresa">Empresa</option>
                    <option value="local">Local</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isRoot && (
          <div className="rounded-md border p-3">
            <div className="text-sm font-medium">Tipo</div>
            <div className="text-sm text-muted-foreground capitalize">{tipo}</div>
          </div>
        )}

        {(isCorporacion || isEmpresa) && (
          <>
            <FormField
              control={control}
              name={joinPath(basePath, "ruc") as Path<any>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUC</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input maxLength={11} placeholder="20123456789" {...field} value={field.value ?? ""} />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={Boolean(lookupLoadingPath)}
                        onClick={() => onLookupRuc(rucPath)}
                      >
                        {lookupLoadingPath === rucPath ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={joinPath(basePath, "razon_social") as Path<any>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón social</FormLabel>
                  <FormControl>
                    <Input placeholder="Razón social" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="md:col-span-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name={joinPath(basePath, "nombre_comercial") as Path<any>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabel>Nombre comercial</RequiredLabel>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nombre comercial" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(isEmpresa || isLocal) && (
            <FormField
              control={control}
              name={joinPath(basePath, "direccion") as Path<any>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>Dirección</RequiredLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {isLocal && (
        <FormField
          control={control}
          name={localTypesPath as Path<any>}
          render={() => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Tipos de local</RequiredLabel>
              </FormLabel>
              <div className="flex flex-wrap gap-4 rounded-lg border bg-background/30 px-4 py-3">
                {localTypeOptions.map((option) => (
                  <label key={option.codigo} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedLocalTypes?.includes(option.codigo) ?? false}
                      onCheckedChange={(checked) => {
                        const current = selectedLocalTypes ?? [];
                        const next =
                          checked === true
                            ? Array.from(new Set([...current, option.codigo]))
                            : current.filter((item) => item !== option.codigo);

                        setValue(localTypesPath as Path<ClientSchema>, next as any, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <span>{option.nombre}</span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label className="font-semibold flex items-center gap-2">
              <UsersRound className="w-4 h-4" />
              Datos de contacto
            </Label>
            <p className="text-sm text-muted-foreground">
              {allowMultipleContacts
                ? "Puedes registrar uno o mas contactos para este cliente principal."
                : "Un contacto principal por cliente."}
            </p>
          </div>
          {allowMultipleContacts && (
            <Button type="button" size="sm" onClick={addContact}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar contacto
            </Button>
          )}
        </div>

        {!allowMultipleContacts && (
          <>
          {showSameCompanyContact && (
            <div className="mt-4 rounded-lg border bg-background/40 p-3">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={sameCompanyContact === true}
                  onCheckedChange={(checked) => syncCompanyContact(checked === true)}
                />
                <span className="grid gap-1">
                  <span className="font-medium">
                    El contacto del local es el mismo de la empresa
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Al marcarlo se copia el contacto principal de la empresa y se bloquean estos campos.
                  </span>
                </span>
              </label>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <FormField
            control={control}
            name={joinPath(joinPath(basePath, "contacto"), "dni") as Path<any>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNI</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      maxLength={8}
                      placeholder="12345678"
                      disabled={sameCompanyContact === true}
                      {...field}
                      value={field.value ?? ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={Boolean(lookupLoadingPath) || sameCompanyContact === true}
                      onClick={() => onLookupDni(dniPath)}
                    >
                      {lookupLoadingPath === dniPath ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={joinPath(joinPath(basePath, "contacto"), "nombre") as Path<any>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabel>Nombre completo</RequiredLabel>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre completo"
                    disabled={sameCompanyContact === true}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={joinPath(joinPath(basePath, "contacto"), "celular") as Path<any>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    maxLength={9}
                    placeholder="987654321"
                    disabled={sameCompanyContact === true}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={joinPath(joinPath(basePath, "contacto"), "email") as Path<any>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="correo@empresa.com"
                    disabled={sameCompanyContact === true}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 rounded-lg border bg-background/30 px-4 py-3">
            <FormField
              control={control}
              name={joinPath(joinPath(basePath, "contacto"), "es_dueno") as Path<any>}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      disabled={sameCompanyContact === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Es dueño</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={joinPath(joinPath(basePath, "contacto"), "es_vendedor") as Path<any>}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      disabled={sameCompanyContact === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Vendedor / referido</FormLabel>
                </FormItem>
              )}
            />
          </div>
          </>
        )}

        {allowMultipleContacts && (
          <div className="mt-4 space-y-4">
            {contacts.fields.map((contact, index) => {
              const contactBasePath = joinPath(basePath, `contactos.${index}`);
              const contactDniPath = joinPath(contactBasePath, "dni");

              return (
                <div key={contact.id} className="rounded-lg border bg-background/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="font-semibold">
                      Contacto {index + 1}
                      {index === 0 && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          Principal
                        </span>
                      )}
                    </div>
                    {contacts.fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => contacts.remove(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FormField
                      control={control}
                      name={contactDniPath as Path<any>}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DNI</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input maxLength={8} placeholder="12345678" {...field} value={field.value ?? ""} />
                              <Button
                                type="button"
                                variant="outline"
                                disabled={Boolean(lookupLoadingPath)}
                                onClick={() => onLookupDni(contactDniPath)}
                              >
                                {lookupLoadingPath === contactDniPath ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Search className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={joinPath(contactBasePath, "nombre") as Path<any>}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <RequiredLabel>Nombre completo</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={joinPath(contactBasePath, "celular") as Path<any>}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input maxLength={9} placeholder="987654321" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={joinPath(contactBasePath, "email") as Path<any>}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input placeholder="correo@empresa.com" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 rounded-lg border bg-background/30 px-4 py-3">
                    <FormField
                      control={control}
                      name={joinPath(contactBasePath, "es_dueno") as Path<any>}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Es dueño</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={joinPath(contactBasePath, "es_vendedor") as Path<any>}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Vendedor / referido</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {childTypes.length > 0 && (
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label className="font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {isCorporacion ? "Empresas" : "Locales"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isCorporacion
                  ? "La corporación puede contener una o más empresas."
                  : "La empresa puede contener uno o más locales."}
              </p>
            </div>
            <div className="flex gap-2">
              {childTypes.map((childType) => (
                <Button key={childType} type="button" size="sm" onClick={() => addChild(childType)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar {childType === "empresa" ? "empresa" : "local"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {children.fields.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Sin elementos asociados.
              </div>
            ) : (
              children.fields.map((item, index) => (
                <div key={item.id} className={index === 0 ? "px-4 pb-4 pt-0" : "p-4"}>
                  <ClientNodeSection
                    control={control}
                    basePath={joinPath(basePath, `hijos.${index}`)}
                    title={`${childTypes[0] === "empresa" ? "Empresa" : "Local"} ${index + 1}`}
                    onLookupRuc={onLookupRuc}
                    onLookupDni={onLookupDni}
                    localTypeOptions={localTypeOptions}
                    lookupLoadingPath={lookupLoadingPath}
                  />
                  <div className="flex justify-end pt-3">
                    <Button type="button" variant="outline" onClick={() => children.remove(index)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const ClientForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ClientFormProps) => {
  const [lookupLoadingPath, setLookupLoadingPath] = useState<string | null>(null);
  const [localTypeOptions, setLocalTypeOptions] = useState<LocalTypeResource[]>([]);
  const form = useForm<ClientSchema>({
    resolver: zodResolver(
      mode === "create" ? clientSchemaCreate : clientSchemaUpdate
    ),
    defaultValues: cloneNode(
      (defaultValues as Partial<ClientFormNode>) ?? createEmptyClientNode("local"),
      true
    ),
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(
      cloneNode(
        (defaultValues as Partial<ClientFormNode>) ?? createEmptyClientNode("local"),
        true
      )
    );
  }, [defaultValues, form]);

  useEffect(() => {
    getAllLocalTypes()
      .then(setLocalTypeOptions)
      .catch(() => {
        errorToast("No se pudieron cargar los tipos de local.");
      });
  }, []);

  const handleLookupRuc = async (path: string) => {
    const ruc = form.getValues(path as Path<ClientSchema>)?.trim();

    if (!ruc || ruc.length !== 11) {
      form.setError(path as Path<ClientSchema>, {
        message: "Ingresa un RUC válido de 11 dígitos.",
      });
      return;
    }

    const basePath = path === "ruc" ? "" : path.replace(/\.ruc$/, "");

    try {
      setLookupLoadingPath(path);
      const response = await lookupClientByRuc(ruc);
      const data = response.data;
      const raw = data.raw ?? {};
      const razonSocial = data.razon_social ?? raw.RazonSocial ?? "";
      const direccion = data.direccion ?? raw.Direccion ?? "";

      form.setValue(joinPath(basePath, "ruc") as Path<ClientSchema>, data.ruc ?? ruc, {
        shouldValidate: true,
      });
      form.setValue(joinPath(basePath, "razon_social") as Path<ClientSchema>, razonSocial, {
        shouldValidate: true,
      });
      if (direccion) {
        form.setValue(joinPath(basePath, "direccion") as Path<ClientSchema>, direccion, {
          shouldValidate: true,
        });
      }
      if (data.nombre_comercial) {
        form.setValue(joinPath(basePath, "nombre_comercial") as Path<ClientSchema>, data.nombre_comercial, {
          shouldValidate: true,
        });
      }
      successToast("Busqueda de RUC completada.", razonSocial || "Datos obtenidos correctamente.");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "No se pudo consultar el RUC."
        : "No se pudo consultar el RUC.";
      errorToast(message);
    } finally {
      setLookupLoadingPath(null);
    }
  };

  const handleLookupDni = async (path: string) => {
    const dni = form.getValues(path as Path<ClientSchema>)?.trim();

    if (!dni || dni.length !== 8) {
      form.setError(path as Path<ClientSchema>, {
        message: "Ingresa un DNI válido de 8 dígitos.",
      });
      return;
    }

    const basePath = path === "contacto.dni" ? "contacto" : path.replace(/\.dni$/, "");

    try {
      setLookupLoadingPath(path);
      const response = await lookupClientByDni(dni);
      const data = response.data;
      const raw = data.raw ?? {};
      const nombreCompleto =
        data.nombre_completo ??
        [data.nombres ?? raw.nombres, data.apepat ?? raw.apepat, data.apemat ?? raw.apemat]
          .filter(Boolean)
          .join(" ")
          .trim();

      form.setValue(joinPath(basePath, "nombre") as Path<ClientSchema>, nombreCompleto, {
        shouldValidate: true,
      });
      successToast("Busqueda de DNI completada.", nombreCompleto || "Datos obtenidos correctamente.");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "No se pudo consultar el DNI."
        : "No se pudo consultar el DNI.";
      errorToast(message);
    } finally {
      setLookupLoadingPath(null);
    }
  };

  const submitForm = (data: ClientSchema) => {
    onSubmit(stripNode(cloneNode(data as unknown as Partial<ClientFormNode>, true), true));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)} className="space-y-5 w-full">
        <ClientNodeSection
          control={form.control}
          basePath=""
          title="Datos del cliente"
          onLookupRuc={handleLookupRuc}
          onLookupDni={handleLookupDni}
          localTypeOptions={localTypeOptions}
          lookupLoadingPath={lookupLoadingPath}
        />

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            <Loader2 className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`} />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
