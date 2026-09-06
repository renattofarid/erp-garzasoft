import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { LocalTypeResource } from "../lib/localType.interface";

interface Props {
  columns: ColumnDef<LocalTypeResource>[];
  data: LocalTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function LocalTypeTable({
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
