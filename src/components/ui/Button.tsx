import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';

const VARIANT_STYLES: Record<Variant, string> = {
  primary:   'bg-teal-700 hover:bg-teal-800 text-white shadow-sm shadow-teal-900/10',
  secondary: 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm shadow-slate-900/5',
  danger:    'hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-slate-600 border border-slate-200 bg-white/80',
  ghost:     'text-teal-700 hover:text-teal-800 hover:bg-teal-50',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-900/10',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export default function Button({ variant = 'secondary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
