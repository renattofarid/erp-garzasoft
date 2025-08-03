import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 10,
  columns = 4,
  className = "",
}) => {
  // Limita columnas a 3 en pantallas menores a md usando CSS
  // Oculta las columnas extra usando hidden md:table-cell
  return (
    <div className="rounded-lg overflow-hidden">
      <table className={`w-full ${className}`}>
        <thead className="bg-muted h-5 md:h-10">
          <tr>
            {Array.from({ length: columns }).map((_, idx) => (
              <th
                key={idx}
                className={`px-4 py-2 ${idx > 2 ? "hidden md:table-cell" : ""}`}
              >
                <Skeleton className="h-3 md:h-5 w-3/4 rounded sm:rounded-sm" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-gray-50/10 bg-background h-7 md:h-10"
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-4 py-1 md:py-3 ${
                    colIdx > 2 ? "hidden md:table-cell" : ""
                  }`}
                >
                  <Skeleton className="h-3.5 rounded sm:rounded-sm md:h-5" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
