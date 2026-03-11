import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingSpinner({ className, size = "md", label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-blue-900", sizeClasses[size])} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}

export function PageLoader({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
