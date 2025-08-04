import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable.tsx";
import { ProductResource } from "../lib/product.interface";

interface Props {
  columns: ColumnDef<ProductResource>[];
  data: ProductResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductTable({
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
