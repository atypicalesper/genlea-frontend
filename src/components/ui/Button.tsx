import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';

const VARIANT_STYLES: Record<Variant, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
  danger:    'hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-600 border border-gray-200',
  ghost:     'text-blue-600 hover:underline',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export default function Button({ variant = 'secondary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
