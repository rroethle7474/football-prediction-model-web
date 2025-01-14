// hooks/useFileInput.ts
import { useState, useCallback } from 'react'

interface UseFileInputProps {
  onValidFile?: (file: File) => void
  onInvalidFile?: () => void
}

export function useFileInput({ onValidFile, onInvalidFile }: UseFileInputProps = {}) {
  const [key, setKey] = useState(0)

  const resetFileInput = useCallback(() => {
    setKey(prev => prev + 1)
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      onInvalidFile?.()
      return
    }
    onValidFile?.(file)
  }, [onValidFile, onInvalidFile])

  return {
    key,
    resetFileInput,
    handleFileChange
  }
}