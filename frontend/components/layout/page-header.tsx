import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string
  subheading?: string
  actions?: React.ReactNode
}

/**
 * Reusable page header used at the top of every main feature page.
 * Provides consistent spacing, typography, and an optional actions slot.
 */
export function PageHeader({
  heading,
  subheading,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 md:flex-row md:items-start md:justify-between mb-8",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
        {subheading && (
          <p className="text-sm text-muted-foreground max-w-xl">{subheading}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-2 md:mt-0 flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}