import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('bg-card text-card-foreground rounded-lg border border-border shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('p-6 pb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>{children}</h3>
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn('text-sm text-muted-foreground mt-1.5', className)}>{children}</p>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn('flex items-center p-6 pt-0', className)}>{children}</div>
}
