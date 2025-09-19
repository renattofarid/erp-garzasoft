import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { CuentasPorCobrarResource } from "../lib/accounts-receivable.interface";

interface Props {
  columns: ColumnDef<CuentasPorCobrarResource>[];
  data: CuentasPorCobrarResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CuentasPorCobrarTable({
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
