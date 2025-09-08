import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable.tsx";
import { ContractResource } from "../lib/contract.interface";

interface Props {
  columns: ColumnDef<ContractResource>[];
  data: ContractResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ContractTable({
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
          modulos: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
