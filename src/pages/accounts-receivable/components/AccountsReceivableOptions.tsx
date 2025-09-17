"use client";

import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CuentasPorCobrarOptions({
  search,
  setSearch,
  situacionFilter,
  setSituacionFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  situacionFilter: string;
  setSituacionFilter: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por contrato o cliente..."
      />

      <SearchableSelect
        options={[
          { label: "Pendiente", value: "pendiente" },
          { label: "Pagado", value: "pagado" },
          { label: "Vencido", value: "vencido" },
        ]}
        value={situacionFilter || "all"}
        onChange={(value) => setSituacionFilter(value === "all" ? "" : value)}
        placeholder="Filtrar por situación"
        className="w-[180px]"
      />
    </div>
  );
}
