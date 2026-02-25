import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

interface GeminiImageRequest {
  prompt: string
  negativePrompt: string
  aspectRatio: string
  referenceImage?: string  // base64 data URL
  influenceStrength?: number
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured' }, { status: 500 })
  }

  try {
    const { prompt, negativePrompt, aspectRatio, referenceImage }: GeminiImageRequest = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' })

    const fullPrompt = [
      prompt,
      negativePrompt ? `\n\nAvoid: ${negativePrompt}` : '',
      `\n\nTarget aspect ratio: ${aspectRatio}`,
    ].join('')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = []

    if (referenceImage) {
      const [header, data] = referenceImage.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
      parts.push({ inlineData: { mimeType, data } })
    }

    parts.push({ text: fullPrompt })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: { responseModalities: ['IMAGE'] } as any,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = result.response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)
    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: 'Gemini returned no image' }, { status: 500 })
    }

    const url = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[/api/image/gemini]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
