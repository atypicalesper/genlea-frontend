export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function SkeletonText({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <Skeleton className={`${w} ${h}`} />;
}

export function SkeletonBadge() {
  return <Skeleton className="h-5 w-20 rounded-full" />;
}
