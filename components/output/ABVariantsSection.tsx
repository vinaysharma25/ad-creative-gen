'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/output/CopyButton'
import { FeedbackToggle } from '@/components/output/HooksSection'
import type { ABVariant } from '@/lib/types'

interface ABVariantsSectionProps {
  variants: ABVariant[]
  feedback?: string
  onFeedbackChange: (value: string) => void
}

export function ABVariantsSection({ variants, feedback, onFeedbackChange }: ABVariantsSectionProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="space-y-3">
      {variants.map(v => (
        <div key={v.variantId} className="border border-border">
          <div className="border-b border-border px-3 py-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Variant {v.variantId}
            </span>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-0.5">Hypothesis</p>
              <p className="text-xs text-muted-foreground leading-snug">{v.hypothesis}</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-0.5">Hook</p>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug flex-1">{v.hook}</p>
                <CopyButton text={v.hook} />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-0.5">What Makes It Different</p>
              <p className="text-xs text-muted-foreground leading-snug">{v.differentiator}</p>
            </div>
          </div>
        </div>
      ))}

      <FeedbackToggle
        open={feedbackOpen}
        onToggle={() => setFeedbackOpen(o => !o)}
        value={feedback ?? ''}
        onChange={onFeedbackChange}
        placeholder="e.g. Variant B hypothesis is too similar to A. Make C test emotional vs rational angle."
      />
    </div>
  )
}
