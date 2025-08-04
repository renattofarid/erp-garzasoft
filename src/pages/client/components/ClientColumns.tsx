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
  SucursalesCliente,
} from "../lib/client.interface.ts";
import { useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";

export const ClientColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ColumnDef<ClientResource>[] => [
  {
    accessorKey: "dueno_nombre",
    header: "Nombre y Apellidos",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "razon_social",
    header: "Razón Social",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "datos",
    header: "Datos",
    accessorFn: (row) => row,
    cell: ({ getValue }) => {
      const client = getValue() as ClientResource;

      return (
        <div className="flex flex-col gap-1 items-start justify-center">
          <Badge variant="outline" className="flex gap-1 items-center">
            <Mail className="h-4 w-4" />
            <span className="font-semibold">{client.dueno_email}</span>
          </Badge>
          <Badge variant="outline" className="flex gap-1 items-center">
            <Phone className="h-4 w-4" />
            <span className="font-semibold">{client.dueno_celular}</span>
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "contactos_clientes",
    header: "Responsables",
    cell: ({ getValue }) => {
      const contactos = getValue() as ContactosCliente[];
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
    accessorKey: "sucursales_clientes",
    header: "Sucursales",
    cell: ({ getValue }) => {
      const sucursales = getValue() as SucursalesCliente[];
      return (
        <div className="space-y-1">
          {sucursales.map((contacto, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold">{contacto.nombre}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router(`${ClientEditRoute}/${id}`)}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
