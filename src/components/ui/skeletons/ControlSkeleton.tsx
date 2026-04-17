import { Skeleton, SkeletonText } from '../Skeleton';

function QueueCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <div className="grid grid-cols-3 gap-1 mb-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-50 rounded p-1.5">
            <Skeleton className="h-2.5 w-full mb-1" />
            <Skeleton className="h-5 w-8" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-14 rounded" />
      </div>
    </div>
  );
}

function SeedRowSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-2.5 w-28 mb-3" />
      <div className="flex gap-2 items-center">
        <Skeleton className="h-7 w-24 rounded" />
        <Skeleton className="h-7 w-24 rounded" />
        <Skeleton className="h-3 w-48 ml-auto" />
      </div>
    </div>
  );
}

function ManualScrapeSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-2.5 w-24 mb-3" />
      <div className="flex gap-2 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-7 w-28 rounded" />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-40">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-7 w-full rounded" />
        </div>
        <div className="flex flex-col gap-1 w-36">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-7 w-full rounded" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
        <Skeleton className="h-7 w-20 rounded self-end" />
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-2.5 w-36" />
        <Skeleton className="h-7 w-14 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <SkeletonText w="w-32" h="h-2.5" />
              <SkeletonText w="w-8" h="h-2.5" />
            </div>
            <SkeletonText w="w-full" h="h-2" />
            <Skeleton className="h-1.5 w-full rounded-full mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ControlSkeleton() {
  return (
    <div className="px-5 py-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <QueueCardSkeleton key={i} />)}
      </div>
      <SeedRowSkeleton />
      <ManualScrapeSkeleton />
      {/* Active jobs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Skeleton className="h-2.5 w-36 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
              <SkeletonText w="w-20" h="h-3" />
              <SkeletonText w="w-32" h="h-3" />
              <SkeletonText w="w-8" h="h-3 ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <SettingsSkeleton />
    </div>
  );
}
