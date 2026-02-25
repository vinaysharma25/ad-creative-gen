import { NextResponse } from 'next/server'

// Imagen 3 via Google AI REST API — same key as Gemini, proper image generation endpoint
const IMAGEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict'

// Map our aspect ratio strings to Imagen 3 supported values
const ASPECT_MAP: Record<string, string> = {
  '1:1':    '1:1',
  '1.91:1': '16:9',
  '4:5':    '3:4',
  '9:16':   '9:16',
  '16:9':   '16:9',
  '2:3':    '3:4',
  '3:2':    '4:3',
}

interface GeminiImageRequest {
  prompt: string
  negativePrompt: string
  aspectRatio: string
  referenceImage?: string
  influenceStrength?: number
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured' }, { status: 500 })
  }

  try {
    const { prompt, negativePrompt, aspectRatio }: GeminiImageRequest = await req.json()

    const fullPrompt = negativePrompt
      ? `${prompt}\n\nAvoid: ${negativePrompt}`
      : prompt

    const res = await fetch(`${IMAGEN_ENDPOINT}?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: fullPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: ASPECT_MAP[aspectRatio] ?? '1:1',
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Imagen API: ${text}` }, { status: res.status })
    }

    const data = await res.json()
    const prediction = data?.predictions?.[0]
    if (!prediction?.bytesBase64Encoded) {
      return NextResponse.json({ error: 'No image in Imagen response' }, { status: 500 })
    }

    const url = `data:${prediction.mimeType ?? 'image/png'};base64,${prediction.bytesBase64Encoded}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[/api/image/gemini]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
