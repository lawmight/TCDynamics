import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-primary/10",
        className
      )}
      {...props}
    />
  );
};

const CardSkeleton = () => (
  <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-lg p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[160px]" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-[80%]" />
  </div>
);

const HeroSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-6 w-[80%]" />
          <Skeleton className="h-6 w-[60%]" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
        <div className="relative">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export { Skeleton, CardSkeleton, HeroSkeleton };