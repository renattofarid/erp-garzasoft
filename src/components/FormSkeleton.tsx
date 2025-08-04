import { Loader } from "lucide-react";

export default function FormSkeleton() {
  return (
    <div className="w-full max-w-(--breakpoint-lg) mx-auto md:p-4 flex flex-col gap-6 h-full min-h-56">
      <div className="flex justify-center items-center h-full">
        <Loader className="text-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}
