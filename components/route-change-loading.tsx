'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function RouteChangeLoadingInner() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return <LoadingSpinner />
}

export function RouteChangeLoading() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouteChangeLoadingInner />
    </Suspense>
  )
}