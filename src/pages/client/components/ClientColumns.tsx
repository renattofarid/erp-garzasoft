import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { ColumnDef } from "@tanstack/react-table";
import {
  ClientEditRoute,
  ClientResource,
  ContactosCliente,
  getClientDisplayName,
} from "../lib/client.interface.ts";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { Building2, KeyRound, Mail, Phone, ReceiptText } from "lucide-react";

function ClientActionsCell({
  id,
  onDelete,
  onCredentials,
}: {
  id: number;
  onDelete: (id: number) => void;
  onCredentials: (id: number) => void;
}) {
  const router = useNavigate();

  return (
    <SelectActions>
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => router(`${ClientEditRoute}/${id}`)}>
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onCredentials(id)}>
          <KeyRound className="mr-2 size-4" />
          Usuario y clave
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDelete(id)}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </SelectActions>
  );
}

export const ClientColumns = ({
  onDelete,
  onCredentials,
}: {
  onDelete: (id: number) => void;
  onCredentials: (id: number) => void;
}): ColumnDef<ClientResource>[] => [
  {
    accessorKey: "nombre_cliente",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{getClientDisplayName(row.original)}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="capitalize">
            {row.original.tipo_ui ?? (row.original.tipo === "unico" ? "local" : row.original.tipo)}
          </Badge>
          {row.original.ruc && (
            <span className="inline-flex items-center gap-1">
              <ReceiptText className="h-3.5 w-3.5" />
              {row.original.ruc}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "dueno_nombre",
    header: "Dueno",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.dueno_nombre}</div>
        {(row.original.dueno_email || row.original.dueno_celular) && (
          <div className="flex flex-col gap-1 items-start justify-center">
            {row.original.dueno_email && (
              <Badge variant="outline" className="flex gap-1 items-center">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">{row.original.dueno_email}</span>
              </Badge>
            )}
            {row.original.dueno_celular && (
              <Badge variant="outline" className="flex gap-1 items-center">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">{row.original.dueno_celular}</span>
              </Badge>
            )}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "responsable",
    header: "Representacion",
    accessorFn: (row) => row,
    cell: ({ getValue }) => {
      const client = getValue() as ClientResource;

      return (
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Representante:</span>{" "}
            <span>{client.representante_nombre || client.dueno_nombre || "-"}</span>
          </div>
          <div>
            <span className="font-semibold">Responsable:</span>{" "}
            <span>{client.responsable_nombre || "-"}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contactos_clientes",
    header: "Contactos",
    cell: ({ getValue }) => {
      const contactos = getValue() as ContactosCliente[];

      if (!contactos.length) {
        return <span className="text-sm text-muted-foreground">Sin contactos</span>;
      }

      return (
        <div className="space-y-1">
          {contactos.map((contacto, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold">{contacto.nombre}:</span>{" "}
              <span>{contacto.celular}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "hijos_clientes",
    header: "Jerarquia",
    cell: ({ getValue }) => {
      const hijos = getValue() as ClientResource[];

      if (!hijos.length) {
        return <span className="text-sm text-muted-foreground">Sin hijos</span>;
      }

      const renderTree = (nodes: ClientResource[], depth = 0) =>
        nodes.map((node, index) => (
          <div key={`${node.id}-${index}`} className={`text-sm ${depth ? "ml-4" : ""}`}>
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-semibold">
                {getClientDisplayName(node)}
              </span>
              {node.ruc && (
                <span className="text-xs text-muted-foreground">
                  RUC: {node.ruc}
                </span>
              )}
              {node.tipo_ui && (
                <Badge variant="outline" className="capitalize">
                  {node.tipo_ui}
                </Badge>
              )}
            </div>
            {node.hijos_clientes?.length > 0 && (
              <div className="mt-1">{renderTree(node.hijos_clientes, depth + 1)}</div>
            )}
          </div>
        ));

      return <div className="space-y-1">{renderTree(hijos)}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ClientActionsCell
        id={row.original.id}
        onDelete={onDelete}
        onCredentials={onCredentials}
      />
    ),
  },
];
