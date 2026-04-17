import { Skeleton, SkeletonBadge, SkeletonText } from '../Skeleton';

const COLS = ['Name', 'Score', 'Origin %', 'Funding', 'Employees', 'Status', 'Tech Stack', 'Open Roles', 'Sources', 'Contacts', ''];

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {/* Name + domain + pipeline dots */}
      <td className="px-4 py-2.5 max-w-[180px]">
        <SkeletonText w="w-28" h="h-3.5" />
        <SkeletonText w="w-20" h="h-2.5" />
        <div className="flex gap-[3px] mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-1.5 h-1.5 rounded-full" />
          ))}
        </div>
      </td>
      {/* Score */}
      <td className="px-4 py-2.5"><SkeletonText w="w-6" h="h-4" /></td>
      {/* Origin % */}
      <td className="px-4 py-2.5"><SkeletonText w="w-10" h="h-3.5" /></td>
      {/* Funding */}
      <td className="px-4 py-2.5"><SkeletonText w="w-16" h="h-3" /></td>
      {/* Employees */}
      <td className="px-4 py-2.5"><SkeletonText w="w-8" h="h-3" /></td>
      {/* Status */}
      <td className="px-4 py-2.5"><SkeletonBadge /></td>
      {/* Tech stack */}
      <td className="px-4 py-2.5">
        <div className="flex gap-1">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-4 w-8 rounded" />
        </div>
      </td>
      {/* Open roles */}
      <td className="px-4 py-2.5">
        <div className="flex gap-1">
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </td>
      {/* Sources */}
      <td className="px-4 py-2.5">
        <div className="flex gap-1">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>
      </td>
      {/* Contacts */}
      <td className="px-4 py-2.5">
        <div className="flex flex-col gap-0.5">
          <SkeletonText w="w-32" h="h-3" />
          <SkeletonText w="w-24" h="h-2.5" />
        </div>
      </td>
      {/* Actions */}
      <td className="px-4 py-2.5">
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </td>
    </tr>
  );
}

export default function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="px-5 py-3">
      {/* Stats bar skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-0 mb-0 -mx-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 px-4 py-2 border-r border-gray-100 last:border-r-0">
            <Skeleton className="h-2.5 w-16 rounded" />
            <Skeleton className="h-5 w-8 rounded" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2 py-3 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded" />
        ))}
        <Skeleton className="h-7 w-20 rounded ml-auto" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {COLS.map(col => (
                <th key={col} className="text-left px-4 py-2.5 text-gray-400 uppercase tracking-wide text-[11px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-2.5">
        <Skeleton className="h-3.5 w-36 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
