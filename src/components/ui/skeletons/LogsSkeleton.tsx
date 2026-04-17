import { Skeleton, SkeletonBadge, SkeletonText } from '../Skeleton';

function LogRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-2"><SkeletonText w="w-32" h="h-3" /></td>
      <td className="px-4 py-2"><SkeletonText w="w-20" h="h-3" /></td>
      <td className="px-4 py-2"><SkeletonBadge /></td>
      <td className="px-4 py-2"><SkeletonText w="w-6" h="h-3" /></td>
      <td className="px-4 py-2"><SkeletonText w="w-6" h="h-3" /></td>
      <td className="px-4 py-2"><SkeletonText w="w-12" h="h-3" /></td>
      <td className="px-4 py-2"><SkeletonText w="w-10" h="h-3" /></td>
      <td className="px-4 py-2"><SkeletonText w="w-14" h="h-3" /></td>
    </tr>
  );
}

export default function LogsSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="px-5 py-4">
      {/* Filter row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-7 w-28 rounded" />
        </div>
        <div className="flex gap-4 items-center mt-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonText key={i} w="w-20" h="h-3" />)}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Started', 'Scraper', 'Status', 'Companies', 'Contacts', 'Duration', 'Errors', 'Steps'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-gray-400 uppercase tracking-wide text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => <LogRowSkeleton key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
