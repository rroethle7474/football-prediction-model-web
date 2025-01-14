import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("fixed top-0 left-0 w-full z-50", className)}>
      <div className="h-1 w-full bg-blue-100">
        <div className="h-1 bg-blue-600 animate-loading-bar" />
      </div>
    </div>
  )
}