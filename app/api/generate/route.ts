import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, buildUserPrompt, buildRefinementPrompt } from '@/lib/prompts'
import { parseDataUrl } from '@/lib/imageResize'
import type { BrandDNA, CampaignBrief, CampaignReferenceImages, AdCreativeOutput, RefinementRequest } from '@/lib/types'

const client = new Anthropic()

interface GenerateRequest {
  brand: BrandDNA
  brief: CampaignBrief
  refs: CampaignReferenceImages
  refinement?: RefinementRequest
}

function buildImageBlocks(
  brand: BrandDNA,
  refs: CampaignReferenceImages
): Anthropic.ContentBlockParam[] {
  const blocks: Anthropic.ContentBlockParam[] = []

  const assets: [string, string | undefined][] = [
    ['Brand Logo', brand.assets?.logo],
    ['Hero Shot', brand.assets?.heroShot],
    ['Brand Mascot', brand.assets?.mascot],
    ['Reference Model', refs.model],
    ['Reference Product', refs.productVariant],
  ]

  for (const [label, dataUrl] of assets) {
    if (!dataUrl) continue
    const parsed = parseDataUrl(dataUrl)
    if (!parsed) continue
    blocks.push({ type: 'text', text: `[${label}]:` })
    blocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: parsed.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: parsed.data,
      },
    })
  }

  return blocks
}

export async function POST(req: NextRequest) {
  try {
    const { brand, brief, refs, refinement }: GenerateRequest = await req.json()

    const imageBlocks = buildImageBlocks(brand, refs)

    const userText = refinement
      ? buildRefinementPrompt(brief, refinement.previousOutput, refinement.feedback)
      : buildUserPrompt(brief)

    const content: Anthropic.ContentBlockParam[] = [
      ...imageBlocks,
      { type: 'text', text: userText },
    ]

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(brand),
      messages: [{ role: 'user', content }],
    })

    const text = message.content.find(b => b.type === 'text')?.text ?? ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Model returned non-JSON response', raw: text }, { status: 500 })
    }

    const output: AdCreativeOutput = JSON.parse(jsonMatch[0])
    return NextResponse.json(output)
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
