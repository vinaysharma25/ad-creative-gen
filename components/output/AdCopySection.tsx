'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/output/CopyButton'
import { FeedbackToggle } from '@/components/output/HooksSection'
import type { AdCreativeOutput } from '@/lib/types'

interface AdCopySectionProps {
  adCopy: AdCreativeOutput['adCopy']
  feedback?: string
  onFeedbackChange: (value: string) => void
}

export function AdCopySection({ adCopy, feedback, onFeedbackChange }: AdCopySectionProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const blocks = [adCopy.problemAgitateCTA, adCopy.comparison, adCopy.mythBust]

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <div key={i} className="border border-border">
          <div className="border-b border-border px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {block.frameworkName}
            </span>
            <CopyButton text={`${block.headline}\n\n${block.body}\n\n${block.cta}`} />
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug flex-1">{block.headline}</p>
              <CopyButton text={block.headline} />
            </div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{block.body}</p>
              <CopyButton text={block.body} />
            </div>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider">{block.cta}</span>
              <CopyButton text={block.cta} />
            </div>
          </div>
        </div>
      ))}

      <FeedbackToggle
        open={feedbackOpen}
        onToggle={() => setFeedbackOpen(o => !o)}
        value={feedback ?? ''}
        onChange={onFeedbackChange}
        placeholder="e.g. Headline in Problem-Agitate-CTA is too generic. Make the comparison framework more specific to competitor X."
      />
    </div>
  )
}
