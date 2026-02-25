'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AD_SIZES } from '@/lib/adSizes'
import type { AdCreativeOutput, BrandDNA, CampaignBrief, Platform } from '@/lib/types'

interface AdPreviewProps {
  output: AdCreativeOutput
  brief: CampaignBrief
  brand?: BrandDNA
}

const PLATFORM_TABS: { label: string; platform: Platform }[] = [
  { label: '1:1',  platform: 'meta_feed_square' },
  { label: '4:5',  platform: 'meta_feed_portrait' },
  { label: '9:16', platform: 'meta_story' },
]

export function AdPreview({ output, brief, brand }: AdPreviewProps) {
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(brief.platform)

  const size = AD_SIZES[previewPlatform]
  const copy = output.adCopy.problemAgitateCTA
  const bgColor = brand?.primaryColors?.[0] ?? '#18181b'

  // Calculate safe zone insets as percentages of the display container
  const safeTopPct = (size.safeZone.top / size.height) * 100
  const safeBottomPct = (size.safeZone.bottom / size.height) * 100
  const safeLeftPct = (size.safeZone.left / size.width) * 100
  const safeRightPct = (size.safeZone.right / size.width) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
          Layout Preview
        </p>
        <div className="flex">
          {PLATFORM_TABS.map(({ label, platform }) => (
            <button
              key={platform}
              onClick={() => setPreviewPlatform(platform)}
              className={cn(
                'h-5 px-2 text-[9px] font-mono border-y border-r first:border-l transition-colors',
                previewPlatform === platform
                  ? 'border-foreground text-foreground bg-foreground/5'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview container — maintains aspect ratio */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: `${size.width} / ${size.height}`,
          backgroundColor: bgColor,
          maxHeight: '400px',
        }}
      >
        {/* Content layer */}
        <div className="absolute inset-0 flex flex-col justify-center items-center p-[8%] text-center gap-2">
          <p className="text-white font-semibold text-[clamp(8px,2vw,16px)] leading-tight max-w-[80%]">
            {copy.headline}
          </p>
          <p className="text-white/70 text-[clamp(6px,1.4vw,11px)] leading-snug max-w-[70%]">
            {copy.body.split(' ').slice(0, 15).join(' ')}…
          </p>
          <div
            className="mt-2 px-3 py-1 text-[clamp(6px,1.2vw,10px)] font-mono uppercase tracking-wider"
            style={{ border: '1px solid rgba(255,255,255,0.6)', color: 'white' }}
          >
            {copy.cta}
          </div>
        </div>

        {/* Safe zone overlays — semi-transparent red over unsafe areas */}
        {safeTopPct > 0 && (
          <div
            className="absolute top-0 left-0 right-0 bg-red-500/20 border-b border-red-500/40"
            style={{ height: `${safeTopPct}%` }}
          />
        )}
        {safeBottomPct > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-red-500/20 border-t border-red-500/40"
            style={{ height: `${safeBottomPct}%` }}
          />
        )}
        {safeLeftPct > 0 && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-red-500/20 border-r border-red-500/40"
            style={{ width: `${safeLeftPct}%` }}
          />
        )}
        {safeRightPct > 0 && (
          <div
            className="absolute top-0 bottom-0 right-0 bg-red-500/20 border-l border-red-500/40"
            style={{ width: `${safeRightPct}%` }}
          />
        )}
      </div>

      <p className="text-[9px] font-mono text-muted-foreground/40">
        Red zones = unsafe area for key content · {size.safeZoneDescription}
      </p>
    </div>
  )
}
