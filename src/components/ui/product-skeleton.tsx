import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <Skeleton className="h-28 w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-3 px-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const StoreCardSkeleton = () => (
  <div className="w-40 flex-shrink-0 bg-card rounded-xl border border-border overflow-hidden">
    <Skeleton className="h-24 w-full" />
    <div className="p-2 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const StoreGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-3 px-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden bg-card rounded-xl border border-border">
        <Skeleton className="h-20 w-full" />
        <div className="p-2">
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const DepartmentSkeleton = () => (
  <div className="flex flex-col items-center gap-2 w-20">
    <Skeleton className="h-14 w-14 rounded-xl" />
    <Skeleton className="h-3 w-12" />
  </div>
);

export const DepartmentGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="flex gap-4 px-4 overflow-x-auto pb-2">
    {Array.from({ length: count }).map((_, i) => (
      <DepartmentSkeleton key={i} />
    ))}
  </div>
);
