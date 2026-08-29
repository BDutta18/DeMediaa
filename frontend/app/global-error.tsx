"use client"

import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl">??</div>
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error?.digest && (
              <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
            )}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium hover:bg-muted transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
