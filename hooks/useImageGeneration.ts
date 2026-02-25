'use client'

import { useState, useCallback } from 'react'
import type { ImagePrompt, ImageProvider } from '@/lib/types'

export interface ImageGenState {
  status: 'idle' | 'generating' | 'done' | 'error'
  url?: string
  error?: string
}

export function useImageGeneration() {
  const [states, setStates] = useState<Record<number, ImageGenState>>({})
  const [strengths, setStrengths] = useState<Record<number, number>>({})

  const setStrength = useCallback((index: number, value: number) => {
    setStrengths(prev => ({ ...prev, [index]: value }))
  }, [])

  const generate = useCallback(async (
    index: number,
    imagePrompt: ImagePrompt,
    provider: ImageProvider,
    referenceImage?: string,
  ) => {
    setStates(prev => ({ ...prev, [index]: { status: 'generating' } }))

    const strength = strengths[index] ?? 0.7
    const endpoint =
      provider === 'gemini'  ? '/api/image/gemini' :
      provider === 'flux'    ? '/api/image/flux'   :
                               '/api/image/ideogram'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.prompt,
          negativePrompt: imagePrompt.negativePrompt,
          aspectRatio: imagePrompt.aspectRatio,
          referenceImage,
          influenceStrength: strength,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? 'Image generation failed')
      }

      const { url } = await res.json()
      setStates(prev => ({ ...prev, [index]: { status: 'done', url } }))
    } catch (err) {
      setStates(prev => ({ ...prev, [index]: { status: 'error', error: String(err) } }))
    }
  }, [strengths])

  const reset = useCallback(() => {
    setStates({})
    setStrengths({})
  }, [])

  return { states, strengths, setStrength, generate, reset }
}
