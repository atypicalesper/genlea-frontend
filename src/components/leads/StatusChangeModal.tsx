import { useEffect, useRef, useState } from 'react';
import type { LeadStatus } from '../../types';

const VALID_STATUSES: LeadStatus[] = ['hot_verified', 'hot', 'warm', 'cold', 'disqualified', 'pending'];

const STATUS_META: Record<LeadStatus, { label: string; style: string }> = {
  hot_verified: { label: 'Hot Verified',  style: 'border-orange-300 bg-orange-50 text-orange-700 has-[:checked]:ring-2 has-[:checked]:ring-orange-300' },
  hot:          { label: 'Hot',           style: 'border-red-300    bg-red-50    text-red-600    has-[:checked]:ring-2 has-[:checked]:ring-red-300' },
  warm:         { label: 'Warm',          style: 'border-yellow-300 bg-yellow-50 text-yellow-700 has-[:checked]:ring-2 has-[:checked]:ring-yellow-300' },
  cold:         { label: 'Cold',          style: 'border-blue-300   bg-blue-50   text-blue-700   has-[:checked]:ring-2 has-[:checked]:ring-blue-300' },
  disqualified: { label: 'Disqualified',  style: 'border-gray-300   bg-gray-50   text-gray-500   has-[:checked]:ring-2 has-[:checked]:ring-gray-300' },
  pending:      { label: 'Pending',       style: 'border-purple-300 bg-purple-50 text-purple-700 has-[:checked]:ring-2 has-[:checked]:ring-purple-300' },
};

interface StatusChangeModalProps {
  companyName: string;
  currentStatus: LeadStatus;
  onConfirm: (status: LeadStatus, reason?: string) => void;
  onClose: () => void;
}

export default function StatusChangeModal({
  companyName, currentStatus, onConfirm, onClose,
}: StatusChangeModalProps) {
  const [selected, setSelected] = useState<LeadStatus>(currentStatus);
  const [reason, setReason] = useState('');
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button on open
  useEffect(() => { confirmRef.current?.focus(); }, []);

  // Keyboard dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-80 max-w-[calc(100vw-2rem)]"
        onMouseDown={e => e.stopPropagation()}
      >
        <h3 className="font-semibold text-gray-800 text-sm mb-0.5">Change Status</h3>
        <p className="text-[11px] text-gray-400 mb-4 truncate" title={companyName}>{companyName}</p>

        <div className="flex flex-col gap-1.5 mb-5">
          {VALID_STATUSES.map(s => {
            const { label, style } = STATUS_META[s];
            return (
              <label
                key={s}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${style} ${selected === s ? 'ring-2' : ''}`}
              >
                <input
                  type="radio"
                  name="lead-status"
                  value={s}
                  checked={selected === s}
                  onChange={() => setSelected(s)}
                  className="sr-only"
                />
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === s ? 'border-current' : 'border-gray-300'}`}>
                  {selected === s && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </span>
                {label}
              </label>
            );
          })}
        </div>

        {selected === 'disqualified' && (
          <div className="mb-5">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Disqualification reason
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Why should this lead be removed from outreach?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-blue-300"
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={() => onConfirm(selected, reason.trim() || undefined)}
            disabled={selected === currentStatus && !(selected === 'disqualified' && reason.trim())}
            className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
