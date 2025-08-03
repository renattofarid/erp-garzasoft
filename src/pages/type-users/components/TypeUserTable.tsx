import { TypeUserResource } from "../lib/typeUser.interface.ts";
import { TypeUserColumns } from "./TypeUserColumns.tsx";
import { DataTable } from "@/components/DataTable.tsx";

interface Props {
  columns: TypeUserColumns[];
  data: TypeUserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypeUserTable({
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
        initialColumnVisibility={{
          estado_uso: false,
          status: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
