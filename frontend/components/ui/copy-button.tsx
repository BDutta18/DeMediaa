"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  label?: string
  timeout?: number
}

export function CopyButton({
  value,
  label = "Copy",
  className,
  timeout = 2000,
  ...props
}: CopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard(timeout)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-1.5 h-8 text-xs font-medium", className)}
      onClick={() => copy(value)}
      aria-label={isCopied ? "Copied" : label}
      {...props}
    >
      {isCopied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{label}</span>
        </>
      )}
    </Button>
  )
}
