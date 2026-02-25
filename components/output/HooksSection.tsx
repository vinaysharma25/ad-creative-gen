'use client'

import { useState } from 'react'
import { MessageSquare, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/output/CopyButton'
import { cn } from '@/lib/utils'
import type { Hook } from '@/lib/types'

interface HooksSectionProps {
  hooks: Hook[]
  feedback?: string
  onFeedbackChange: (value: string) => void
}

export function HooksSection({ hooks, feedback, onFeedbackChange }: HooksSectionProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="space-y-3">
      {hooks.map((hook, i) => (
        <div key={i} className="border border-border p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug flex-1">{hook.text}</p>
            <CopyButton text={hook.text} className="shrink-0 mt-0.5" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-mono rounded-none px-1.5 py-0 h-5">
              {hook.technique}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-mono rounded-none px-1.5 py-0 h-5">
              {hook.psychologicalTrigger}
            </Badge>
          </div>
        </div>
      ))}

      <FeedbackToggle
        open={feedbackOpen}
        onToggle={() => setFeedbackOpen(o => !o)}
        value={feedback ?? ''}
        onChange={onFeedbackChange}
        placeholder="e.g. Make hooks less aggressive, lean into curiosity more. Avoid questions."
      />
    </div>
  )
}

/* ── shared feedback toggle ── */
export function FeedbackToggle({
  open, onToggle, value, onChange, placeholder,
}: {
  open: boolean
  onToggle: () => void
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="border border-dashed border-border">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors',
          value ? 'text-amber-600' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <MessageSquare className="h-3 w-3" />
        {value ? 'Feedback added' : 'Add feedback'}
        <ChevronDown className={cn('h-3 w-3 ml-auto transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 pb-2 text-xs font-mono bg-transparent border-t border-border resize-none focus:outline-none placeholder:text-muted-foreground/40"
        />
      )}
    </div>
  )
}
