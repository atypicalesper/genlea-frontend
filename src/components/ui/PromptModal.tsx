// PromptModal — replaces native window.prompt() for inputs that need validation.
// Supports max length, required, multiline (reason fields).
import { useEffect, useState } from 'react';

export interface PromptModalProps {
  open: boolean;
  title: string;
  description?: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  multiline?: boolean;
  maxLength?: number;
  required?: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export default function PromptModal({
  open,
  title,
  description,
  initialValue = '',
  placeholder = '',
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  multiline = false,
  maxLength = 500,
  required = false,
  onConfirm,
  onClose,
}: PromptModalProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError(null);
    }
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (required && !trimmed) {
      setError('This field is required');
      return;
    }
    if (trimmed.length > maxLength) {
      setError(`Must be ${maxLength} characters or fewer`);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
      >
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 whitespace-pre-line text-xs text-slate-600">{description}</p>
        )}

        {multiline ? (
          <textarea
            autoFocus
            value={value}
            onChange={e => { setValue(e.target.value); setError(null); }}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={4}
            className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setError(null); }}
            placeholder={placeholder}
            maxLength={maxLength}
            className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        )}

        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span className={error ? 'text-red-600' : ''}>{error ?? ''}</span>
          <span>{value.length} / {maxLength}</span>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
