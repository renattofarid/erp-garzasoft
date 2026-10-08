import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // Por defecto 5
  pageSize?: number;
  totalItems?: number;
  onPageSizeChange?: (pageSize: number) => void;
}

export default function DataTablePagination({
  page,
  totalPages,
  onPageChange,
  maxButtons = 5,
  pageSize = 10,
  totalItems,
  onPageSizeChange,
}: Props) {
  const [buttons, setButtons] = useState(maxButtons);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const handler = () => setButtons(media.matches ? 2 : maxButtons);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [maxButtons]);

  const half = Math.floor(buttons / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, page + half);

  if (end - start < buttons - 1) {
    if (start === 1) {
      end = Math.min(totalPages, start + buttons - 1);
    } else if (end === totalPages) {
      start = Math.max(1, end - buttons + 1);
    }
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const firstItem = totalItems && totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItem = totalItems ? Math.min(page * pageSize, totalItems) : 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span>Registros por página</span>
            <Select value={String(pageSize)} onValueChange={(value) => { onPageSizeChange(Number(value)); onPageChange(1); }}>
              <SelectTrigger className="h-8 w-[72px] bg-background text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {totalItems !== undefined && <span className="hidden sm:inline">Mostrando {firstItem}-{lastItem} de {totalItems}</span>}
      </div>
      <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-40" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
          />
        </PaginationItem>

        {start > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {start > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
      </Pagination>
    </div>
  );
}
