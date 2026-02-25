'use client'

import { useState, useCallback } from 'react'
import type {
  BrandDNA,
  CampaignBrief,
  CampaignReferenceImages,
  AdCreativeOutput,
  SectionFeedback,
  RefinementRequest,
} from '@/lib/types'

type GenerationState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'done'; output: AdCreativeOutput; previousOutput?: AdCreativeOutput }
  | { status: 'error'; message: string }

export function useAdGeneration() {
  const [state, setState] = useState<GenerationState>({ status: 'idle' })

  const generate = useCallback(async (
    brand: BrandDNA,
    brief: CampaignBrief,
    refs: CampaignReferenceImages,
  ) => {
    setState({ status: 'generating' })
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, brief, refs }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? 'Generation failed')
      }
      const output: AdCreativeOutput = await res.json()
      setState({ status: 'done', output })
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [])

  const refine = useCallback(async (
    brand: BrandDNA,
    brief: CampaignBrief,
    refs: CampaignReferenceImages,
    previousOutput: AdCreativeOutput,
    feedback: SectionFeedback,
  ) => {
    setState(prev => ({
      status: 'generating',
      // preserve previous so we can compare after
    }))
    const refinement: RefinementRequest = { previousOutput, feedback }
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, brief, refs, refinement }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? 'Refinement failed')
      }
      const output: AdCreativeOutput = await res.json()
      setState({ status: 'done', output, previousOutput })
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [])

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, generate, refine, reset }
}
