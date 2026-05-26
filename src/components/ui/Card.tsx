import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'ai' | 'urgent' | 'highlight'
  className?: string
  onClick?: () => void
}

const variants = {
  default: 'bg-[var(--bg-card)] border border-[var(--bg-border)]',
  ai: 'bg-gradient-to-br from-[#1A1A2E] to-[#1E1E35] border border-[rgba(99,102,241,0.3)]',
  urgent: 'bg-[var(--bg-card)] border border-[var(--bg-border)] border-l-[3px] border-l-[#F59E0B]',
  highlight: 'bg-[var(--bg-card)] border border-[#6366F1]/30',
}

export function Card({ children, variant = 'default', className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-[12px] p-4
        ${variants[variant]}
        ${variant === 'ai' ? 'shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'shadow-[var(--shadow-sm)]'}
        ${onClick ? 'cursor-pointer hover:shadow-[var(--shadow-md)] transition-all duration-150 hover:-translate-y-px' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
