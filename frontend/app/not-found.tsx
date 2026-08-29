import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-black tracking-tight text-primary">404</div>
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground text-lg">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium hover:bg-muted transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
