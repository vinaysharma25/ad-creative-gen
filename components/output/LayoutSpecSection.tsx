'use client'

import { useState } from 'react'
import { FeedbackToggle } from '@/components/output/HooksSection'
import type { LayoutSpec } from '@/lib/types'

interface LayoutSpecSectionProps {
  spec: LayoutSpec
  feedback?: string
  onFeedbackChange: (value: string) => void
}

export function LayoutSpecSection({ spec, feedback, onFeedbackChange }: LayoutSpecSectionProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="border border-border divide-y divide-border">
        <SpecRow label="Dimensions" value={spec.platformDimensions} />
        <SpecRow label="Safe Zone" value={spec.safeZone} />
        <SpecRow label="CTA Placement" value={spec.ctaPlacement} />
        <SpecRow label="Color Usage" value={spec.colorUsage} />
        <div className="px-3 py-2">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1.5">Text Hierarchy</p>
          <ol className="space-y-1">
            {spec.textHierarchy.map((t, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-snug">
                <span className="font-mono text-[10px] text-muted-foreground/50 mr-1.5">{i + 1}.</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
        <div className="px-3 py-2">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1.5">Moodboard</p>
          <div className="flex flex-wrap gap-1.5">
            {spec.moodboardKeywords.map((kw, i) => (
              <span key={i} className="text-[10px] font-mono border border-border px-2 py-0.5 text-muted-foreground">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      <FeedbackToggle
        open={feedbackOpen}
        onToggle={() => setFeedbackOpen(o => !o)}
        value={feedback ?? ''}
        onChange={onFeedbackChange}
        placeholder="e.g. Move CTA to bottom third. Use primary color for headline, not background."
      />
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2">
      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-0.5">{label}</p>
      <p className="text-xs text-muted-foreground leading-snug">{value}</p>
    </div>
  )
}
