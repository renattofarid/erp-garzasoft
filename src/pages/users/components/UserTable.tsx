import { DataTable } from "@/components/DataTable.tsx";
import { UserColumns } from "./UserColumns";
import { UserResource } from "../lib/User.interface";

interface Props {
  columns: UserColumns[];
  data: UserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function UserTable({
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
