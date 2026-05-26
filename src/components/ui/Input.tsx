import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
}

export function Input({ label, icon, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full h-10 bg-[var(--bg-surface)] border border-[var(--bg-border)]
            rounded-[6px] px-3 text-sm text-[var(--text-primary)]
            placeholder:text-[var(--text-tertiary)]
            focus:outline-none focus:border-[#6366F1] transition-colors duration-150
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-[#EF4444]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#EF4444]">{error}</span>}
    </div>
  )
}
