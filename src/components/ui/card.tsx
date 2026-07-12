import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`bs-card ${className}`.trim()}>{children}</div>
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`bs-card-header ${className}`.trim()}>{children}</div>
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h3 className={`bs-card-title ${className}`.trim()}>{children}</h3>
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`bs-card-content ${className}`.trim()}>{children}</div>
}
