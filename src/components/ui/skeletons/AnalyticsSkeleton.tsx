import { Skeleton, SkeletonText } from '../Skeleton';

function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-2.5 w-24 mb-2" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-2.5 w-32" />
    </div>
  );
}

function StatusBreakdownSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-2.5 w-36 mb-4" />
      <Skeleton className="h-4 w-full rounded-full mb-4" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-2 rounded-full shrink-0" />
            <SkeletonText w="w-20" h="h-3" />
            <Skeleton className="h-3 w-6 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueSummarySkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-2.5 w-24 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <SkeletonText w="w-20" h="h-3" />
              <SkeletonText w="w-24" h="h-3" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsSkeleton() {
  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-7 w-16 rounded" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <StatusBreakdownSkeleton />
      <QueueSummarySkeleton />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
