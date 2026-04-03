interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string; }

const SIZE = { sm: 'w-3 h-3 border', md: 'w-4 h-4 border-2', lg: 'w-6 h-6 border-2' };

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${SIZE[size]} border-blue-400 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
