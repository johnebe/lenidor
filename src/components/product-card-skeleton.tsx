import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ProductCardSkeletonProps {
  className?: string
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        className
      )}
    >
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-auto flex items-end gap-2 pt-1">
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="mt-2 h-8 w-full" />
      </div>
    </div>
  )
}
