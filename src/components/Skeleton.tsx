interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-foreground/10 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function QuoteSkeleton() {
  return (
    <div className="max-w-[65ch] mx-auto px-6 py-12 text-center">
      {/* Quote text - 3 lines */}
      <div className="space-y-3 mb-8">
        <Skeleton className="h-7 w-full sm:h-8" />
        <Skeleton className="h-7 w-4/5 mx-auto sm:h-8" />
        <Skeleton className="h-7 w-3/5 mx-auto sm:h-8" />
      </div>
      {/* Author */}
      <Skeleton className="h-5 w-32 mx-auto mb-2" />
      {/* Source */}
      <Skeleton className="h-4 w-40 mx-auto" />
    </div>
  );
}

export function ArchiveItemSkeleton() {
  return (
    <article className="border-b border-foreground/10 pb-6">
      {/* Quote text - 2 lines */}
      <div className="space-y-2 mb-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      {/* Author */}
      <Skeleton className="h-4 w-28 mb-2" />
      {/* Date and reflection preview */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-48" />
      </div>
    </article>
  );
}

export function FavoriteItemSkeleton() {
  return (
    <article className="border-b border-foreground/10 pb-6">
      {/* Quote component skeleton */}
      <div className="max-w-[65ch] mx-auto px-6 py-12 text-center">
        <div className="space-y-3 mb-8">
          <Skeleton className="h-7 w-full sm:h-8" />
          <Skeleton className="h-7 w-4/5 mx-auto sm:h-8" />
          <Skeleton className="h-7 w-3/5 mx-auto sm:h-8" />
        </div>
        <Skeleton className="h-5 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
      {/* Saved date */}
      <div className="text-center mt-2">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </article>
  );
}
