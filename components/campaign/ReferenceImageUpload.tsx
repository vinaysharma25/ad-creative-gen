'use client'

import { useRef, useState } from 'react'
import { ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resizeImage } from '@/lib/imageResize'

interface ReferenceImageUploadProps {
  label: string
  sublabel?: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
}

export function ReferenceImageUpload({ label, sublabel, value, onChange }: ReferenceImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (!file.type.startsWith('image/')) { setError('Images only'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Max 10MB'); return }
    try {
      onChange(await resizeImage(file))
    } catch {
      setError('Failed to process image')
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground/50">{sublabel}</p>}
      </div>
      <div
        className={cn(
          'relative h-24 border border-dashed rounded-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors',
          dragging ? 'border-foreground bg-muted/30' : 'border-border hover:border-foreground/40',
          value && 'border-solid'
        )}
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-contain p-1.5" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(undefined) }}
              className="absolute top-1 right-1 bg-background border border-border rounded-none p-0.5 hover:border-destructive hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
            <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
              {dragging ? 'Drop' : 'Upload'}
            </span>
          </>
        )}
      </div>
      {error && <p className="text-[10px] text-destructive font-mono">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}
