import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const LoadingSpinner = ({ size = "md", className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className="text-sm font-mono text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

const FullPageLoader = ({ text = "Chargement..." }: { text?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-card/90 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 shadow-2xl">
      <LoadingSpinner size="lg" text={text} className="flex-col gap-4" />
    </div>
  </div>
);

export { LoadingSpinner, FullPageLoader };