import type { BrandDNA, CampaignBrief, AdCreativeOutput, SectionFeedback } from '@/lib/types'
import { getAdSize } from '@/lib/adSizes'

export function buildSystemPrompt(brand: BrandDNA): string {
  return `You are a world-class performance marketing creative director embodying the ${brand.name} brand.

## YOUR BRAND IDENTITY
- Positioning: ${brand.positioning}
- Personality: ${brand.brandPersonality}
- Tone of Voice: ${brand.toneOfVoice.join(', ')}
- Primary Audience: ${brand.targetAudiencePrimary}
- Audience Sophistication: ${brand.audienceSophisticationLevel}
- Audience Pains: ${brand.audiencePains.join(' | ')}
- Audience Desires: ${brand.audienceDesires.join(' | ')}
- Differentiators: ${brand.differentiators.join(' | ')}
- Competitors: ${brand.competitorNames.join(', ')}

## COPY RULES (ABSOLUTE)
- FORBIDDEN words — never use: ${brand.forbiddenWords.length ? brand.forbiddenWords.join(', ') : 'none'}
- POWER words — weave in naturally: ${brand.powerWords.length ? brand.powerWords.join(', ') : 'none'}
- Approved CTAs: ${brand.cta.join(', ')}

## VISUAL GUARDRAILS
- Visual style: ${brand.visualStyle}
- Colors: ${brand.primaryColors.join(', ')}
- Imagery don'ts: ${brand.imageryDont.length ? brand.imageryDont.join(' | ') : 'none'}

You have deep expertise in direct response advertising, consumer psychology, and platform-native creative strategy. Every output must drive high ROAS.

You MUST respond with valid JSON only — no markdown fences, no prose outside the JSON structure.`
}

export function buildUserPrompt(brief: CampaignBrief): string {
  const adSize = getAdSize(brief.platform)

  return `Generate a complete ad creative package for the following campaign.

## CAMPAIGN BRIEF
- Product: ${brief.productName}
- Description: ${brief.productDescription}
- Audience Segment: ${brief.audienceSegment}
- Emotional Angle: ${brief.emotionalAngle}
- Offer: ${brief.offer}
- Platform: ${adSize.label}
- Platform Dimensions: ${adSize.width}×${adSize.height}px
- Safe Zone: ${adSize.safeZoneDescription}
- Objective: ${brief.objective}
- Additional Context: ${brief.additionalContext || 'None'}

## OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "hooks": [
    {
      "text": "hook text — max 125 characters, punchy, scroll-stopping",
      "technique": "e.g. Pattern Interrupt | Curiosity Gap | Social Proof | Bold Claim | Direct Question",
      "psychologicalTrigger": "e.g. Fear of Missing Out | Identity | Status | Curiosity | Loss Aversion"
    }
  ],
  "adCopy": {
    "problemAgitateCTA": {
      "frameworkName": "Problem-Agitate-CTA",
      "headline": "bold, benefit-driven headline",
      "body": "2–3 sentences: name the pain, agitate it, then introduce the solution",
      "cta": "action-oriented CTA from approved list"
    },
    "comparison": {
      "frameworkName": "Before/After Comparison",
      "headline": "contrast-driven headline",
      "body": "2–3 sentences showing transformation",
      "cta": "action-oriented CTA"
    },
    "mythBust": {
      "frameworkName": "Myth Bust",
      "headline": "\"You don't need X to get Y\" style headline",
      "body": "2–3 sentences busting the myth and offering truth",
      "cta": "action-oriented CTA"
    }
  },
  "imagePrompts": [
    {
      "purpose": "hero",
      "prompt": "Detailed prompt: visual style, subject, lighting, composition, mood, color palette. Must reflect brand visual style.",
      "negativePrompt": "What to avoid — stock photo aesthetics, competing brand colors, forbidden imagery",
      "aspectRatio": "${adSize.aspectRatio}"
    },
    {
      "purpose": "lifestyle",
      "prompt": "Lifestyle scene: environment, emotion, subject activity, natural lighting, authentic feel",
      "negativePrompt": "Overproduced, staged, corporate, stock-photo feel",
      "aspectRatio": "${adSize.aspectRatio}"
    },
    {
      "purpose": "text_overlay",
      "prompt": "Clean, minimal background optimised for text overlay. Simple gradient or texture. Brand colors. Breathing room.",
      "negativePrompt": "Busy patterns, faces, text in image, distracting elements",
      "aspectRatio": "${adSize.aspectRatio}"
    }
  ],
  "layoutSpec": {
    "platformDimensions": "${adSize.width}×${adSize.height}px",
    "safeZone": "${adSize.safeZoneDescription}",
    "textHierarchy": [
      "1. Hook — placement, size, weight, color",
      "2. Sub-headline — placement and style",
      "3. Body copy — placement and style",
      "4. CTA button — placement, size, color"
    ],
    "ctaPlacement": "Specific placement guidance for ${adSize.label}",
    "colorUsage": "How to apply brand colors to this specific layout",
    "moodboardKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  },
  "abVariants": [
    {
      "variantId": "A",
      "hypothesis": "Testing X because we believe Y audience responds to Z",
      "hook": "Variant A hook — full text",
      "differentiator": "What makes this variant structurally different"
    },
    {
      "variantId": "B",
      "hypothesis": "Testing X because we believe Y audience responds to Z",
      "hook": "Variant B hook — full text",
      "differentiator": "What makes this variant structurally different"
    },
    {
      "variantId": "C",
      "hypothesis": "Testing X because we believe Y audience responds to Z",
      "hook": "Variant C hook — full text",
      "differentiator": "What makes this variant structurally different"
    }
  ]
}

Generate exactly 5 hooks. Make every word earn its place.`
}

export function buildRefinementPrompt(
  brief: CampaignBrief,
  previousOutput: AdCreativeOutput,
  feedback: SectionFeedback
): string {
  const adSize = getAdSize(brief.platform)
  const hasFeedback = Object.values(feedback).some(v =>
    v !== undefined && v !== '' && (typeof v !== 'object' || Object.keys(v).length > 0)
  )

  if (!hasFeedback) return buildUserPrompt(brief)

  const feedbackSections: string[] = []

  if (feedback.hooks) feedbackSections.push(`HOOKS FEEDBACK: ${feedback.hooks}`)
  if (feedback.adCopy) feedbackSections.push(`AD COPY FEEDBACK: ${feedback.adCopy}`)
  if (feedback.imagePrompts) feedbackSections.push(`IMAGE PROMPTS FEEDBACK (global): ${feedback.imagePrompts}`)
  if (feedback.perImageFeedback) {
    for (const [idx, note] of Object.entries(feedback.perImageFeedback)) {
      const purpose = previousOutput.imagePrompts[Number(idx)]?.purpose ?? `image ${idx}`
      feedbackSections.push(`IMAGE PROMPT [${purpose}] FEEDBACK: ${note}`)
    }
  }
  if (feedback.layoutSpec) feedbackSections.push(`LAYOUT SPEC FEEDBACK: ${feedback.layoutSpec}`)
  if (feedback.abVariants) feedbackSections.push(`A/B VARIANTS FEEDBACK: ${feedback.abVariants}`)

  return `You previously generated an ad creative package for this campaign. The user has reviewed it and left specific feedback. Regenerate the ENTIRE output incorporating all corrections.

## CAMPAIGN BRIEF
- Product: ${brief.productName}
- Description: ${brief.productDescription}
- Audience Segment: ${brief.audienceSegment}
- Emotional Angle: ${brief.emotionalAngle}
- Offer: ${brief.offer}
- Platform: ${adSize.label} (${adSize.width}×${adSize.height}px)
- Safe Zone: ${adSize.safeZoneDescription}
- Objective: ${brief.objective}
- Additional Context: ${brief.additionalContext || 'None'}

## PREVIOUS OUTPUT (for reference)
${JSON.stringify(previousOutput, null, 2)}

## USER FEEDBACK — APPLY ALL OF THIS
${feedbackSections.join('\n')}

Regenerate the full JSON output, addressing every piece of feedback. Keep what worked; fix what didn't. Return the same JSON structure as before. No prose, no markdown fences.`
}
