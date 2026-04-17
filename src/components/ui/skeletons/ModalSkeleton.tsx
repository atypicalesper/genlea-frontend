import { Skeleton, SkeletonBadge, SkeletonText } from '../Skeleton';

export default function ModalSkeleton() {
  return (
    <div className="px-6 py-4 space-y-5">
      {/* Score + status row */}
      <div className="flex items-center gap-3 flex-wrap">
        <Skeleton className="h-9 w-12 rounded" />
        <SkeletonBadge />
        <SkeletonBadge />
        <SkeletonText w="w-32" h="h-3" />
      </div>

      {/* Score breakdown */}
      <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <SkeletonText w="w-24" h="h-2.5" />
            <SkeletonText w="w-8" h="h-4" />
          </div>
        ))}
      </div>

      {/* Company info grid */}
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-1">
            <SkeletonText w="w-16" h="h-3" />
            <SkeletonText w="w-24" h="h-3" />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <SkeletonText w="w-full" h="h-3" />
        <SkeletonText w="w-5/6" h="h-3" />
        <SkeletonText w="w-3/4" h="h-3" />
      </div>

      {/* Tech stack */}
      <div>
        <SkeletonText w="w-20" h="h-2.5" />
        <div className="flex flex-wrap gap-1 mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-14 rounded" />
          ))}
        </div>
      </div>

      {/* Contacts table placeholder */}
      <div>
        <SkeletonText w="w-28" h="h-2.5" />
        <div className="mt-2 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <SkeletonText w="w-28" h="h-3" />
              <SkeletonText w="w-20" h="h-3" />
              <SkeletonText w="w-40" h="h-3" />
              <SkeletonText w="w-16" h="h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
