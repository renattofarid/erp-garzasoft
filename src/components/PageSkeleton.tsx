import { Skeleton } from "@/components/ui/skeleton";
import TableSkeleton from "./TableSkeleton";

export default function PageSkeleton() {
  return (
    <div className="w-full mx-auto md:p-4 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="h-6 w-full md:w-36" />
      </div>
      <TableSkeleton columns={5} rows={10} className="w-full" />
    </div>
  );
}
