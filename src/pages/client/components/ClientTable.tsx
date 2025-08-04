import { ColumnDef } from "@tanstack/react-table";
import { ClientResource } from "../lib/client.interface.ts";
import { DataTable } from "@/components/DataTable.tsx";

interface Props {
  columns: ColumnDef<ClientResource>[];
  data: ClientResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ClientTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
