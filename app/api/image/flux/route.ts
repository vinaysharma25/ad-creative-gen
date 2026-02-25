import { fal } from '@fal-ai/client'
import { NextResponse } from 'next/server'

// Size map: aspectRatio string → fal.ai image_size preset
const SIZE_MAP: Record<string, string> = {
  '1:1':    'square_hd',
  '1.91:1': 'landscape_16_9',
  '4:5':    'portrait_4_3',
  '9:16':   'portrait_16_9',
  '16:9':   'landscape_16_9',
  '2:3':    'portrait_4_3',
  '3:2':    'landscape_4_3',
}

interface FluxRequest {
  prompt: string
  negativePrompt: string
  aspectRatio: string
  referenceImage?: string  // base64 data URL or public URL
  influenceStrength?: number
}

export async function POST(req: Request) {
  if (!process.env.FAL_API_KEY) {
    return NextResponse.json({ error: 'FAL_API_KEY not configured' }, { status: 500 })
  }

  fal.config({ credentials: process.env.FAL_API_KEY })

  try {
    const { prompt, aspectRatio, referenceImage, influenceStrength }: FluxRequest = await req.json()

    const image_size = SIZE_MAP[aspectRatio] ?? 'square_hd'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any

    if (referenceImage && !referenceImage.startsWith('data:')) {
      // Public URL — use image-to-image
      result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input: {
          prompt,
          image_url: referenceImage,
          strength: influenceStrength ?? 0.7,
          num_inference_steps: 28,
        } as any,
      })
    } else {
      // Text-to-image (base64 refs not supported by fal img2img)
      result = await fal.subscribe('fal-ai/flux/schnell', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input: {
          prompt,
          image_size,
          num_inference_steps: 4,
        } as any,
      })
    }

    const url: string = result?.data?.images?.[0]?.url
    if (!url) {
      return NextResponse.json({ error: 'No image URL in Flux response' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error('[/api/image/flux]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
