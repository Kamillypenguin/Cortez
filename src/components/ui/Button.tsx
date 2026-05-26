import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  icon?: ReactNode
  fullWidth?: boolean
}

const styles: Record<Variant, string> = {
  primary: 'bg-[#6366F1] hover:bg-[#4F52CC] text-white',
  secondary: 'border border-[var(--bg-border)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white',
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-[34px] px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-[6px]
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${styles[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
