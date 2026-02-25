'use client'

import { useState } from 'react'
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { CopyButton } from '@/components/output/CopyButton'
import { FeedbackToggle } from '@/components/output/HooksSection'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { cn } from '@/lib/utils'
import type { ImagePrompt, ImageProvider, CampaignReferenceImages } from '@/lib/types'

// Routing recommendation: which provider is best for each purpose
const RECOMMENDED_PROVIDER: Record<ImagePrompt['purpose'], ImageProvider> = {
  text_overlay: 'gemini',  // Best text-in-image
  lifestyle:    'flux',    // Photorealistic people
  hero:         'ideogram', // Style variants / product
}

const PROVIDER_LABELS: Record<ImageProvider, string> = {
  gemini:   'Gemini',
  flux:     'Flux',
  ideogram: 'Ideogram',
}

const PURPOSE_LABELS: Record<ImagePrompt['purpose'], string> = {
  text_overlay: 'Text Overlay',
  lifestyle:    'Lifestyle',
  hero:         'Hero',
}

interface ImagePromptsSectionProps {
  imagePrompts: ImagePrompt[]
  globalFeedback?: string
  perImageFeedback?: Record<number, string>
  onGlobalFeedbackChange: (v: string) => void
  onPerImageFeedbackChange: (index: number, v: string) => void
  refs?: CampaignReferenceImages
}

export function ImagePromptsSection({
  imagePrompts,
  globalFeedback,
  perImageFeedback,
  onGlobalFeedbackChange,
  onPerImageFeedbackChange,
  refs,
}: ImagePromptsSectionProps) {
  const { states, strengths, setStrength, generate } = useImageGeneration()
  const [globalFeedbackOpen, setGlobalFeedbackOpen] = useState(false)
  const [perFeedbackOpen, setPerFeedbackOpen] = useState<Record<number, boolean>>({})

  function getReferenceForPrompt(prompt: ImagePrompt): string | undefined {
    if (prompt.purpose === 'lifestyle') return refs?.model
    if (prompt.purpose === 'hero') return refs?.productVariant
    return undefined
  }

  return (
    <div className="space-y-4">
      {imagePrompts.map((prompt, i) => {
        const state = states[i] ?? { status: 'idle' }
        const strength = strengths[i] ?? 0.7
        const recommended = RECOMMENDED_PROVIDER[prompt.purpose]
        const refImage = getReferenceForPrompt(prompt)
        const imgFeedback = perImageFeedback?.[i] ?? ''

        return (
          <div key={i} className="border border-border">
            {/* Header */}
            <div className="border-b border-border px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {PURPOSE_LABELS[prompt.purpose]}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground/60">
                  {prompt.aspectRatio}
                </span>
              </div>
              <CopyButton text={prompt.prompt} />
            </div>

            <div className="p-3 space-y-3">
              {/* Prompt text */}
              <p className="text-xs text-muted-foreground leading-relaxed">{prompt.prompt}</p>

              {/* Negative prompt */}
              {prompt.negativePrompt && (
                <p className="text-[10px] text-muted-foreground/50 font-mono">
                  — {prompt.negativePrompt}
                </p>
              )}

              {/* Reference image indicator */}
              {refImage && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Reference image attached
                </div>
              )}

              {/* Influence strength slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                    Influence Strength
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {strength.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.9}
                  step={0.1}
                  value={strength}
                  onChange={e => setStrength(i, parseFloat(e.target.value))}
                  className="w-full h-1 accent-foreground"
                />
                <div className="flex justify-between text-[9px] font-mono text-muted-foreground/40">
                  <span>Creative</span>
                  <span>Faithful</span>
                </div>
              </div>

              {/* Generate buttons */}
              <div className="flex gap-1">
                {(['gemini', 'flux', 'ideogram'] as ImageProvider[]).map(provider => (
                  <button
                    key={provider}
                    onClick={() => generate(i, prompt, provider, refImage)}
                    disabled={state.status === 'generating'}
                    className={cn(
                      'flex-1 h-7 text-[9px] font-mono uppercase tracking-widest transition-colors',
                      'border flex items-center justify-center gap-1',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      provider === recommended
                        ? 'border-foreground text-foreground hover:bg-foreground hover:text-background'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                    )}
                  >
                    {state.status === 'generating' && provider === recommended ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : null}
                    {PROVIDER_LABELS[provider]}
                  </button>
                ))}
              </div>

              {/* Generated image */}
              {state.status === 'done' && state.url && (
                <div className="border border-border overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={state.url}
                    alt={`Generated ${prompt.purpose} image`}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {state.status === 'generating' && (
                <div className="border border-border p-4 flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Generating image…
                </div>
              )}

              {state.status === 'error' && (
                <div className="border border-destructive/30 p-3 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[10px] font-mono text-destructive leading-relaxed">{state.error}</p>
                </div>
              )}

              {/* Per-image feedback */}
              <FeedbackToggle
                open={perFeedbackOpen[i] ?? false}
                onToggle={() => setPerFeedbackOpen(prev => ({ ...prev, [i]: !prev[i] }))}
                value={imgFeedback}
                onChange={v => onPerImageFeedbackChange(i, v)}
                placeholder="e.g. Make this more cinematic. Use warmer tones."
              />
            </div>
          </div>
        )
      })}

      {/* Global image feedback */}
      <FeedbackToggle
        open={globalFeedbackOpen}
        onToggle={() => setGlobalFeedbackOpen(o => !o)}
        value={globalFeedback ?? ''}
        onChange={onGlobalFeedbackChange}
        placeholder="e.g. All images feel too corporate. Push toward editorial/documentary style."
      />
    </div>
  )
}
