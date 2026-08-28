"use client";

import { useMemo, useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  CalendarDays,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";
import { useAllProducts } from "@/pages/products/lib/product.hook";

export interface ContractFiltersState {
  search: string;
  numero: string;
  clienteId: string;
  productoId: string;
  createdFrom: string;
  createdTo: string;
  vigenciaFrom: string;
  vigenciaTo: string;
}

interface ContractOptionsProps {
  filters: ContractFiltersState;
  onFilterChange: <K extends keyof ContractFiltersState>(
    key: K,
    value: ContractFiltersState[K]
  ) => void;
  onResetFilters: () => void;
}

export default function ContractOptions({
  filters,
  onFilterChange,
  onResetFilters,
}: ContractOptionsProps) {
  const { data: clients } = useAllClients();
  const { data: products } = useAllProducts();
  const [datesPopoverOpen, setDatesPopoverOpen] = useState(false);

  const clientOptions = useMemo(() => {
    if (!clients) return [];
    return [
      { label: "Todos los clientes", value: "all" },
      ...clients.map((c) => ({
        label: getClientDisplayName(c),
        value: c.id.toString(),
        description: c.ruc ? `RUC: ${c.ruc}` : undefined,
      })),
    ];
  }, [clients]);

  const productOptions = useMemo(() => {
    if (!products) return [];
    return [
      { label: "Todos los productos", value: "all" },
      ...products.map((p) => ({
        label: p.nombre,
        value: p.id.toString(),
      })),
    ];
  }, [products]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.numero) count++;
    if (filters.clienteId && filters.clienteId !== "all") count++;
    if (filters.productoId && filters.productoId !== "all") count++;
    if (filters.createdFrom || filters.createdTo) count++;
    if (filters.vigenciaFrom || filters.vigenciaTo) count++;
    return count;
  }, [filters]);

  const activeDateFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.createdFrom || filters.createdTo) count++;
    if (filters.vigenciaFrom || filters.vigenciaTo) count++;
    return count;
  }, [filters]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Búsqueda general */}
        <SearchInput
          value={filters.search}
          onChange={(val) => onFilterChange("search", val)}
          placeholder="Buscar contratos..."
          className="w-full sm:w-[220px]"
        />

        {/* Filtro por Número de Contrato específico */}
        <div className="w-full sm:w-[170px]">
          <SearchInput
            value={filters.numero}
            onChange={(val) => onFilterChange("numero", val)}
            placeholder="N° contrato (ej. CT-...)"
            className="w-full h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Filtro por Cliente */}
        <div className="w-full sm:w-[220px]">
          <SearchableSelect
            options={clientOptions}
            value={filters.clienteId || "all"}
            onChange={(val) => onFilterChange("clienteId", val === "all" ? "" : val)}
            placeholder="Filtrar por cliente"
            className="w-full h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Filtro por Producto */}
        <div className="w-full sm:w-[190px]">
          <SearchableSelect
            options={productOptions}
            value={filters.productoId || "all"}
            onChange={(val) => onFilterChange("productoId", val === "all" ? "" : val)}
            placeholder="Filtrar por producto"
            className="w-full h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Popover de Filtros de Fechas */}
        <Popover open={datesPopoverOpen} onOpenChange={setDatesPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={activeDateFiltersCount > 0 ? "secondary" : "outline"}
              size="sm"
              className="h-9 gap-1.5 text-xs sm:text-sm"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Rango de Fechas</span>
              {activeDateFiltersCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                >
                  {activeDateFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 space-y-4 shadow-lg" align="start">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Filter className="h-4 w-4 text-primary" />
                <span>Filtros por Fecha</span>
              </div>
              {(filters.createdFrom ||
                filters.createdTo ||
                filters.vigenciaFrom ||
                filters.vigenciaTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFilterChange("createdFrom", "");
                    onFilterChange("createdTo", "");
                    onFilterChange("vigenciaFrom", "");
                    onFilterChange("vigenciaTo", "");
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar fechas
                </Button>
              )}
            </div>

            {/* Fecha de Creación */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Fecha de Registro (Creación)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Desde</Label>
                  <Input
                    type="date"
                    value={filters.createdFrom}
                    onChange={(e) => onFilterChange("createdFrom", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Hasta</Label>
                  <Input
                    type="date"
                    value={filters.createdTo}
                    onChange={(e) => onFilterChange("createdTo", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Fecha de Vigencia */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Fecha de Vigencia del Contrato</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Vigente Desde</Label>
                  <Input
                    type="date"
                    value={filters.vigenciaFrom}
                    onChange={(e) => onFilterChange("vigenciaFrom", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Vigente Hasta</Label>
                  <Input
                    type="date"
                    value={filters.vigenciaTo}
                    onChange={(e) => onFilterChange("vigenciaTo", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Botón Limpiar Filtros */}
        {(activeFiltersCount > 0 || filters.search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpiar filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Badges de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Filtros aplicados:
          </span>

          {filters.numero && (
            <Badge variant="outline" className="gap-1 py-0.5 px-2 bg-muted/40">
              <span>N°: {filters.numero}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onFilterChange("numero", "")}
              />
            </Badge>
          )}

          {filters.clienteId && filters.clienteId !== "all" && (
            <Badge variant="outline" className="gap-1 py-0.5 px-2 bg-muted/40">
              <span>
                Cliente:{" "}
                {clientOptions.find((c) => c.value === filters.clienteId)?.label ||
                  filters.clienteId}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onFilterChange("clienteId", "")}
              />
            </Badge>
          )}

          {filters.productoId && filters.productoId !== "all" && (
            <Badge variant="outline" className="gap-1 py-0.5 px-2 bg-muted/40">
              <span>
                Producto:{" "}
                {productOptions.find((p) => p.value === filters.productoId)?.label ||
                  filters.productoId}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onFilterChange("productoId", "")}
              />
            </Badge>
          )}

          {(filters.createdFrom || filters.createdTo) && (
            <Badge variant="outline" className="gap-1 py-0.5 px-2 bg-muted/40">
              <span>
                Registro: {filters.createdFrom || "..."} a {filters.createdTo || "..."}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  onFilterChange("createdFrom", "");
                  onFilterChange("createdTo", "");
                }}
              />
            </Badge>
          )}

          {(filters.vigenciaFrom || filters.vigenciaTo) && (
            <Badge variant="outline" className="gap-1 py-0.5 px-2 bg-muted/40">
              <span>
                Vigencia: {filters.vigenciaFrom || "..."} a {filters.vigenciaTo || "..."}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  onFilterChange("vigenciaFrom", "");
                  onFilterChange("vigenciaTo", "");
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
