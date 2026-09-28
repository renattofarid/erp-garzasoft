"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  IdCard,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { errorToast, successToast } from "@/lib/core.function";
import {
  deleteContact,
  getContacts,
  updateContact,
} from "../lib/contact.actions";
import {
  ContactDescription,
  ContactIconName,
  ContactTitle,
  type ContactResource,
} from "../lib/contact.interface";
import TitleComponent from "@/components/TitleComponent";

const editSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  celular: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "El celular debe tener 9 dígitos")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Correo inválido")
    .optional()
    .or(z.literal("")),
  es_dueno: z.boolean().default(false),
  es_vendedor: z.boolean().default(false),
});

type EditValues = z.infer<typeof editSchema>;

const tipoLabel: Record<string, string> = {
  corporacion: "Corporación",
  empresa: "Empresa",
  local: "Local",
};

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: ContactResource;
  onEdit: (c: ContactResource) => void;
  onDelete: (c: ContactResource) => void;
}) {
  return (
    <div className="rounded-xl border bg-sidebar p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold leading-tight">{contact.nombre}</p>
            {contact.dni && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <IdCard className="h-3 w-3" />
                DNI: {contact.dni}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            onClick={() => onEdit(contact)}
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => onDelete(contact)}
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
        {contact.celular && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {contact.celular}
          </span>
        )}
        {contact.email && (
          <span className="flex items-center gap-1.5 text-muted-foreground truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </span>
        )}
      </div>

      {contact.cliente_nombre && (
        <div className="flex items-center gap-2 pt-1 border-t">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {contact.cliente_nombre}
          </span>
          {contact.cliente_tipo && (
            <Badge variant="secondary" className="text-xs ml-auto shrink-0">
              {tipoLabel[contact.cliente_tipo] ?? contact.cliente_tipo}
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {contact.es_dueno && (
          <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
            Dueño
          </Badge>
        )}
        {contact.es_vendedor && (
          <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">
            Vendedor/Referido
          </Badge>
        )}
      </div>
    </div>
  );
}

function EditContactDialog({
  contact,
  open,
  onOpenChange,
  onSaved,
}: {
  contact: ContactResource | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nombre: "",
      celular: "",
      email: "",
      es_dueno: false,
      es_vendedor: false,
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        nombre: contact.nombre ?? "",
        celular: contact.celular ?? "",
        email: contact.email ?? "",
        es_dueno: contact.es_dueno ?? false,
        es_vendedor: contact.es_vendedor ?? false,
      });
    }
  }, [contact, form]);

  const onSubmit = async (values: EditValues) => {
    if (!contact) return;
    try {
      setSubmitting(true);
      await updateContact(contact.id, {
        nombre: values.nombre,
        celular: values.celular || undefined,
        email: values.email || undefined,
        es_dueno: values.es_dueno,
        es_vendedor: values.es_vendedor,
      });
      successToast("Contacto actualizado", "Los datos se actualizaron correctamente.");
      onSaved();
      onOpenChange(false);
    } catch {
      errorToast("Error al actualizar el contacto.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Editar contacto
          </DialogTitle>
          {contact?.dni && (
            <p className="text-sm text-muted-foreground">
              DNI: {contact.dni} — Los cambios se aplicarán a todos los
              clientes que tengan este contacto.
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="987654321" maxLength={9} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="es_dueno"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Es dueño</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="es_vendedor"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Vendedor / referido</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                <Loader2 className={`h-4 w-4 mr-2 ${submitting ? "animate-spin" : "hidden"}`} />
                <Check className={`h-4 w-4 mr-2 ${submitting ? "hidden" : ""}`} />
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function ContactPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ContactResource[]>([]);
  const [meta, setMeta] = useState<{ total: number; last_page: number; current_page: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editContact, setEditContact] = useState<ContactResource | null>(null);
  const [deleteContact_, setDeleteContact] = useState<ContactResource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getContacts({ params: { page, search, per_page: 12 } });
      setData(res.data);
      setMeta(res.meta as any);
    } catch {
      errorToast("Error al cargar contactos.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteContact_) return;
    setIsDeleting(true);
    try {
      await deleteContact(deleteContact_.id);
      successToast("Contacto eliminado correctamente.");
      await load();
    } catch {
      errorToast("Error al eliminar el contacto.");
    } finally {
      setIsDeleting(false);
      setDeleteContact(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <TitleComponent
          title={ContactTitle}
          subtitle={ContactDescription}
          icon={ContactIconName}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, DNI, celular o correo..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      {meta && (
        <p className="text-sm text-muted-foreground">
          {meta.total} contacto{meta.total !== 1 ? "s" : ""} registrado{meta.total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-sidebar p-4 h-40 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">Sin contactos</p>
          <p className="text-sm">
            {search
              ? "No se encontraron contactos con ese criterio."
              : "Registra clientes para ver sus contactos aquí."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              onEdit={setEditContact}
              onDelete={setDeleteContact}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <EditContactDialog
        contact={editContact}
        open={editContact !== null}
        onOpenChange={(v) => !v && setEditContact(null)}
        onSaved={load}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteContact_ !== null}
        onOpenChange={(v) => !v && setDeleteContact(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a{" "}
              <strong>{deleteContact_?.nombre}</strong> como contacto de{" "}
              <strong>{deleteContact_?.cliente_nombre ?? "este cliente"}</strong>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
