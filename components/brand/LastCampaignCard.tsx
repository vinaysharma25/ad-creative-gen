'use client'

import { RotateCcw, X } from 'lucide-react'
import { AD_SIZES } from '@/lib/adSizes'
import type { SavedCampaign } from '@/lib/types'

interface LastCampaignCardProps {
  campaign: SavedCampaign
  onResume: () => void
  onClear: () => void
}

export function LastCampaignCard({ campaign, onResume, onClear }: LastCampaignCardProps) {
  const { brief, savedAt } = campaign
  const platformLabel = AD_SIZES[brief.platform]?.label ?? brief.platform

  const date = new Date(savedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="border border-dashed border-border">
      <div className="px-3 py-2">
        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1.5">
          Last Campaign
        </p>
        <p className="text-xs font-medium leading-snug truncate">{brief.productName}</p>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
          {platformLabel} · {date}
        </p>
      </div>
      <div className="border-t border-dashed border-border flex">
        <button
          onClick={onResume}
          className="flex-1 h-7 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-r border-dashed border-border"
        >
          <RotateCcw className="h-3 w-3" />
          Resume
        </button>
        <button
          onClick={onClear}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title="Clear saved campaign"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
