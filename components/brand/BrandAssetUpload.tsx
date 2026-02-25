'use client'

import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resizeImage } from '@/lib/imageResize'

interface BrandAssetUploadProps {
  label: string
  value?: string           // base64 data URL
  onChange: (dataUrl: string | undefined) => void
  className?: string
}

export function BrandAssetUpload({ label, value, onChange, className }: BrandAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('JPG, PNG or WebP only')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Max 10MB')
      return
    }
    try {
      const resized = await resizeImage(file)
      onChange(resized)
    } catch {
      setError('Failed to process image')
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <div
        className={cn(
          'relative h-28 rounded border border-dashed transition-colors cursor-pointer select-none',
          'flex flex-col items-center justify-center gap-1',
          dragging
            ? 'border-foreground bg-muted/40'
            : 'border-border hover:border-foreground/40 hover:bg-muted/20',
          value && 'border-solid border-border'
        )}
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="h-full w-full rounded object-contain p-2"
            />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(undefined) }}
              className="absolute top-1 right-1 rounded bg-background/90 border border-border p-0.5 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <>
            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
            <span className="text-[10px] font-mono text-muted-foreground/60 tracking-wide">
              {dragging ? 'DROP' : 'UPLOAD'}
            </span>
          </>
        )}
      </div>
      {error && <p className="text-[10px] text-destructive font-mono">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
