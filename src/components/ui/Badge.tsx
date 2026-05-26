import type { ReactNode } from 'react'

type BadgeVariant = 'urgent' | 'warning' | 'normal' | 'done' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  urgent: 'bg-[#FEE2E2] text-[#DC2626]',
  warning: 'bg-[#FEF3C7] text-[#D97706]',
  normal: 'bg-[#EDE9FE] text-[#7C3AED]',
  done: 'bg-[#D1FAE5] text-[#059669]',
  neutral: 'bg-[#F3F4F6] text-[#6B7280]',
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
        ${styles[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
