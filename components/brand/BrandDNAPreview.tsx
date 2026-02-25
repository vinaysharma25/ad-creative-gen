'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BrandDNA } from '@/lib/types'

interface BrandDNAPreviewProps {
  brand: BrandDNA
  onEdit: () => void
}

export function BrandDNAPreview({ brand, onEdit }: BrandDNAPreviewProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Brand DNA
          </span>
          <span className="text-xs font-semibold truncate max-w-[140px]">{brand.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Color swatches */}
          <div className="flex gap-0.5">
            {brand.primaryColors.slice(0, 4).map((color, i) => (
              <div
                key={i}
                className="h-3 w-3 border border-border/50"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 border border-transparent hover:border-border"
          >
            Edit
          </button>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-border px-3 py-3 grid grid-cols-2 gap-x-6 gap-y-3">
          <PreviewRow label="Positioning" value={brand.positioning} />
          <PreviewRow label="Personality" value={brand.brandPersonality} />
          <PreviewRow label="Tone" value={brand.toneOfVoice.join(', ')} />
          <PreviewRow label="Audience" value={brand.targetAudiencePrimary} />
          <PreviewRow label="Sophistication" value={brand.audienceSophisticationLevel} />
          <PreviewRow label="Visual Style" value={brand.visualStyle} />
          {brand.powerWords.length > 0 && (
            <PreviewRow label="Power Words" value={brand.powerWords.join(', ')} />
          )}
          {brand.forbiddenWords.length > 0 && (
            <PreviewRow label="Forbidden" value={brand.forbiddenWords.join(', ')} className="text-destructive/70" />
          )}
          {brand.differentiators.length > 0 && (
            <div className="col-span-2">
              <PreviewRow label="Differentiators" value={brand.differentiators.join(' · ')} />
            </div>
          )}

          {/* Asset thumbnails */}
          {(brand.assets?.logo || brand.assets?.heroShot || brand.assets?.mascot) && (
            <div className="col-span-2 flex gap-2 mt-1">
              {[
                { label: 'Logo', src: brand.assets.logo },
                { label: 'Hero', src: brand.assets.heroShot },
                { label: 'Mascot', src: brand.assets.mascot },
              ].filter(a => a.src).map(a => (
                <div key={a.label} className="flex flex-col items-center gap-0.5">
                  <img src={a.src} alt={a.label} className="h-10 w-10 object-contain border border-border" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">{a.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PreviewRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-0.5">{label}</p>
      <p className={cn('text-xs leading-snug truncate', className)}>{value}</p>
    </div>
  )
}
