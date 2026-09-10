"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";
import { useAllContracts } from "@/pages/contract/lib/contract.hook";
import { Calendar, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AccountsReceivableOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  situacionFilter: string;
  setSituacionFilter: (value: string) => void;
  clienteIdFilter: string;
  setClienteIdFilter: (value: string) => void;
  contratoIdFilter: string;
  setContratoIdFilter: (value: string) => void;
  fechaDesdeFilter: string;
  setFechaDesdeFilter: (value: string) => void;
  fechaHastaFilter: string;
  setFechaHastaFilter: (value: string) => void;
  onClearFilters: () => void;
}

export default function CuentasPorCobrarOptions({
  search,
  setSearch,
  situacionFilter,
  setSituacionFilter,
  clienteIdFilter,
  setClienteIdFilter,
  contratoIdFilter,
  setContratoIdFilter,
  fechaDesdeFilter,
  setFechaDesdeFilter,
  fechaHastaFilter,
  setFechaHastaFilter,
  onClearFilters,
}: AccountsReceivableOptionsProps) {
  const { data: clients } = useAllClients();
  const { data: contracts } = useAllContracts();

  const clientOptions = useMemo(() => {
    if (!clients) return [];
    return clients.map((c) => ({
      label: getClientDisplayName(c),
      value: String(c.id),
      description: c.ruc ? `RUC: ${c.ruc}` : undefined,
    }));
  }, [clients]);

  const contractOptions = useMemo(() => {
    if (!contracts) return [];
    return contracts.map((c) => ({
      label: c.numero,
      value: String(c.id),
      description: c.cliente ? getClientDisplayName(c.cliente) : undefined,
    }));
  }, [contracts]);

  const hasActiveFilters = Boolean(
    search ||
      situacionFilter ||
      clienteIdFilter ||
      contratoIdFilter ||
      fechaDesdeFilter ||
      fechaHastaFilter
  );

  const selectedClient = clients?.find((c) => String(c.id) === clienteIdFilter);
  const selectedContract = contracts?.find((c) => String(c.id) === contratoIdFilter);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controles de Filtro */}
      <div className="flex flex-wrap items-center gap-2.5 w-full">
        {/* Búsqueda por Texto */}
        <div className="min-w-[220px] flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por contrato, cliente o monto..."
          />
        </div>

        {/* Buscador de Cliente */}
        <div className="w-full sm:w-[230px]">
          <SearchableSelect
            options={clientOptions}
            value={clienteIdFilter}
            onChange={setClienteIdFilter}
            placeholder="🏢 Filtrar por cliente..."
            className="w-full h-9 bg-background"
          />
        </div>

        {/* Buscador de Contrato */}
        <div className="w-full sm:w-[190px]">
          <SearchableSelect
            options={contractOptions}
            value={contratoIdFilter}
            onChange={setContratoIdFilter}
            placeholder="📄 Filtrar por contrato..."
            className="w-full h-9 bg-background"
          />
        </div>

        {/* Filtro de Situación */}
        <div className="w-full sm:w-[170px]">
          <SearchableSelect
            options={[
              { label: "Todas las situaciones", value: "all" },
              { label: "🔴 Vencidos", value: "vencido" },
              { label: "🔵 Pendientes", value: "pendiente" },
              { label: "🟢 Pagados", value: "pagado" },
            ]}
            value={situacionFilter || "all"}
            onChange={(value) => setSituacionFilter(value === "all" ? "" : value)}
            placeholder="Filtrar por situación"
            className="w-full h-9 bg-background"
          />
        </div>

        {/* Fechas Vencimiento (Desde / Hasta) */}
        <div className="flex items-center gap-1.5 bg-background border border-input rounded-md px-2 py-1 h-9 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={fechaDesdeFilter}
            onChange={(e) => setFechaDesdeFilter(e.target.value)}
            className="h-7 w-[125px] text-xs border-0 p-0 shadow-none focus-visible:ring-0"
            title="Fecha vencimiento desde"
          />
          <span className="text-muted-foreground font-medium">-</span>
          <Input
            type="date"
            value={fechaHastaFilter}
            onChange={(e) => setFechaHastaFilter(e.target.value)}
            className="h-7 w-[125px] text-xs border-0 p-0 shadow-none focus-visible:ring-0"
            title="Fecha vencimiento hasta"
          />
        </div>

        {/* Botón Limpiar Filtros */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2.5 text-xs text-destructive hover:bg-destructive/10 gap-1.5 font-medium ml-auto sm:ml-0"
          >
            <X className="h-3.5 w-3.5" />
            <span>Limpiar filtros</span>
          </Button>
        )}
      </div>

      {/* Chips de Filtros Activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span className="text-muted-foreground font-semibold flex items-center gap-1">
            <Filter className="h-3 w-3 text-primary" />
            <span>Filtros activos:</span>
          </span>

          {search && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5 px-2 bg-primary/10 text-primary">
              <span>Texto: "{search}"</span>
              <X className="h-3 w-3 cursor-pointer hover:opacity-80" onClick={() => setSearch("")} />
            </Badge>
          )}

          {clienteIdFilter && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
              <span>Cliente: {selectedClient ? getClientDisplayName(selectedClient) : clienteIdFilter}</span>
              <X className="h-3 w-3 cursor-pointer hover:opacity-80" onClick={() => setClienteIdFilter("")} />
            </Badge>
          )}

          {contratoIdFilter && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5 px-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
              <span>Contrato: {selectedContract?.numero || contratoIdFilter}</span>
              <X className="h-3 w-3 cursor-pointer hover:opacity-80" onClick={() => setContratoIdFilter("")} />
            </Badge>
          )}

          {situacionFilter && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5 px-2 capitalize bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              <span>Situación: {situacionFilter}</span>
              <X className="h-3 w-3 cursor-pointer hover:opacity-80" onClick={() => setSituacionFilter("")} />
            </Badge>
          )}

          {(fechaDesdeFilter || fechaHastaFilter) && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              <span>Vencimiento: {fechaDesdeFilter || "..."} a {fechaHastaFilter || "..."}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-80"
                onClick={() => {
                  setFechaDesdeFilter("");
                  setFechaHastaFilter("");
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
