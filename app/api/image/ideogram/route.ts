import { NextResponse } from 'next/server'

const IDEOGRAM_API = 'https://api.ideogram.ai/generate'

const ASPECT_MAP: Record<string, string> = {
  '1:1':    'ASPECT_1_1',
  '1.91:1': 'ASPECT_16_9',
  '4:5':    'ASPECT_4_5',
  '9:16':   'ASPECT_9_16',
  '16:9':   'ASPECT_16_9',
  '2:3':    'ASPECT_2_3',
  '3:2':    'ASPECT_3_2',
}

interface IdeogramRequest {
  prompt: string
  negativePrompt: string
  aspectRatio: string
}

export async function POST(req: Request) {
  if (!process.env.IDEOGRAM_API_KEY) {
    return NextResponse.json({ error: 'IDEOGRAM_API_KEY not configured' }, { status: 500 })
  }

  try {
    const { prompt, negativePrompt, aspectRatio }: IdeogramRequest = await req.json()

    const body = {
      image_request: {
        prompt,
        negative_prompt: negativePrompt || undefined,
        aspect_ratio: ASPECT_MAP[aspectRatio] ?? 'ASPECT_1_1',
        model: 'V_2',
        magic_prompt_option: 'AUTO',
      },
    }

    const res = await fetch(IDEOGRAM_API, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Ideogram: ${text}` }, { status: res.status })
    }

    const data = await res.json()
    const url: string = data?.data?.[0]?.url
    if (!url) {
      return NextResponse.json({ error: 'No image URL in Ideogram response' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error('[/api/image/ideogram]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
