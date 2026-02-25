'use client'

import { useRef } from 'react'
import { ChevronDown, Plus, Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BrandDNA } from '@/lib/types'

// Note: DropdownMenu may need to be added via: npx shadcn add dropdown-menu
// If not installed, this falls back to a simple select pattern below.

interface BrandSwitcherProps {
  brands: BrandDNA[]
  activeBrand: BrandDNA | null
  onSelect: (brand: BrandDNA) => void
  onNew: () => void
  onExport: (brand: BrandDNA) => void
  onImport: (json: string) => void
  onDelete: (id: string) => void
}

export function BrandSwitcher({
  brands,
  activeBrand,
  onSelect,
  onNew,
  onExport,
  onImport,
  onDelete,
}: BrandSwitcherProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        onImport(reader.result as string)
      } catch {
        // invalid JSON — ignore
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (brands.length === 0) {
    return (
      <Button
        onClick={onNew}
        variant="outline"
        size="sm"
        className="rounded-none font-mono text-xs uppercase tracking-widest h-8 border-dashed"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        New Brand
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Brand selector */}
      <div className="flex items-center gap-0">
        <select
          value={activeBrand?.id ?? ''}
          onChange={e => {
            const brand = brands.find(b => b.id === e.target.value)
            if (brand) onSelect(brand)
          }}
          className={cn(
            'h-8 border border-border bg-background px-2 pr-7 text-xs font-mono',
            'appearance-none cursor-pointer rounded-none',
            'focus:outline-none focus:ring-1 focus:ring-foreground',
          )}
        >
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <div className="pointer-events-none -ml-6 flex items-center pr-1.5">
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={onNew}
        className="h-8 w-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        title="New brand"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      {activeBrand && (
        <>
          <button
            onClick={() => onExport(activeBrand)}
            className="h-8 w-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            title="Export brand JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="h-8 w-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            title="Import brand JSON"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>
          {brands.length > 1 && (
            <button
              onClick={() => {
                if (confirm(`Delete "${activeBrand.name}"?`)) onDelete(activeBrand.id)
              }}
              className="h-8 w-8 flex items-center justify-center border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              title="Delete brand"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}

      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  )
}
