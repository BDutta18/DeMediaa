"use client"

import * as React from "react"
import { FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/20 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
