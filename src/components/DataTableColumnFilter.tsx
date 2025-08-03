import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Columns } from "lucide-react";
import { useReactTable } from "@tanstack/react-table";

export default function DataTableColumnFilter<TData>({
  table,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns />
          <span className="hidden lg:inline">Mostrar columnas</span>
          <span className="lg:hidden">Columnas</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => {
                column.toggleVisibility(!!value);
                // prevenir cierre automático del dropdown
              }}
              // evitar que el click cierre el menú
              onSelect={(e) => e.preventDefault()}
            >
              {column.columnDef.header?.toString() ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
