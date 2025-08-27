import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable.tsx";
import { NotificationsResource } from "../lib/notifications.interface";

interface Props {
  columns: ColumnDef<NotificationsResource>[];
  data: NotificationsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function NotificationTable({
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
