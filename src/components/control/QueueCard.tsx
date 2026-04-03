import Button from '../ui/Button';
import type { QueueCounts } from '../../types';

interface QueueCardProps {
  name: 'discovery' | 'enrichment' | 'scoring';
  counts: QueueCounts;
  onRetry: () => void;
  onDrain: () => void;
}

const QUEUE_COLORS: Record<string, string> = {
  discovery:  'border-blue-200 bg-blue-50',
  enrichment: 'border-indigo-200 bg-indigo-50',
  scoring:    'border-purple-200 bg-purple-50',
};

const QUEUE_LABEL_COLORS: Record<string, string> = {
  discovery:  'text-blue-700',
  enrichment: 'text-indigo-700',
  scoring:    'text-purple-700',
};

interface StatPillProps { label: string; value: number; color: string }
function StatPill({ label, value, color }: StatPillProps) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function QueueCard({ name, counts, onRetry, onDrain }: QueueCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${QUEUE_COLORS[name]}`}>
      <div className={`font-semibold text-sm capitalize mb-3 ${QUEUE_LABEL_COLORS[name]}`}>
        {name} Queue
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <StatPill label="Waiting"   value={counts.waiting}   color="text-gray-700" />
        <StatPill label="Active"    value={counts.active}    color="text-emerald-600" />
        <StatPill label="Failed"    value={counts.failed}    color="text-red-500" />
        <StatPill label="Done"      value={counts.completed} color="text-gray-400" />
      </div>
      <div className="flex gap-1.5">
        <Button variant="secondary" onClick={onRetry} className="text-xs flex-1">
          ↺ Retry Failed ({counts.failed})
        </Button>
        <Button variant="danger" onClick={onDrain} className="text-xs flex-1">
          ✕ Drain
        </Button>
      </div>
    </div>
  );
}
