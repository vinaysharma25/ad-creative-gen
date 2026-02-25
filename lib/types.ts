export interface BrandDNA {
  id: string
  name: string
  createdAt: string
  positioning: string
  toneOfVoice: string[]
  brandPersonality: string
  targetAudiencePrimary: string
  audiencePains: string[]
  audienceDesires: string[]
  audienceSophisticationLevel: 'unaware' | 'problem-aware' | 'solution-aware' | 'aware'
  primaryColors: string[]
  visualStyle: string
  imageryDont: string[]
  forbiddenWords: string[]
  powerWords: string[]
  cta: string[]
  competitorNames: string[]
  differentiators: string[]
  assets: {
    logo?: string      // base64, resized to 512px
    heroShot?: string  // base64, resized to 512px
    mascot?: string    // base64, resized to 512px
  }
}

export interface CampaignBrief {
  productName: string
  productDescription: string
  audienceSegment: string
  emotionalAngle: string
  offer: string
  platform: Platform
  objective: 'conversions' | 'traffic' | 'awareness' | 'retargeting'
  additionalContext: string
}

export interface CampaignReferenceImages {
  model?: string          // base64, session only
  productVariant?: string // base64, session only
}

export type Platform =
  | 'meta_feed_square'
  | 'meta_feed_landscape'
  | 'meta_feed_portrait'
  | 'meta_story'
  | 'instagram_feed'
  | 'instagram_story'
  | 'instagram_reel'

export interface AdCreativeOutput {
  hooks: Hook[]
  adCopy: {
    problemAgitateCTA: AdCopyBlock
    comparison: AdCopyBlock
    mythBust: AdCopyBlock
  }
  imagePrompts: ImagePrompt[]
  layoutSpec: LayoutSpec
  abVariants: ABVariant[]
}

export interface Hook {
  text: string
  technique: string
  psychologicalTrigger: string
}

export interface AdCopyBlock {
  frameworkName: string
  headline: string
  body: string
  cta: string
}

export interface ImagePrompt {
  purpose: 'text_overlay' | 'hero' | 'lifestyle'
  prompt: string
  negativePrompt: string
  aspectRatio: string
  generatedUrl?: string
}

export interface LayoutSpec {
  platformDimensions: string
  safeZone: string
  textHierarchy: string[]
  ctaPlacement: string
  colorUsage: string
  moodboardKeywords: string[]
}

export interface ABVariant {
  variantId: 'A' | 'B' | 'C'
  hypothesis: string
  hook: string
  differentiator: string
}

export type ImageProvider = 'gemini' | 'ideogram' | 'flux'

export interface SectionFeedback {
  hooks?: string
  adCopy?: string
  imagePrompts?: string                    // global image feedback
  perImageFeedback?: Record<number, string> // keyed by imagePrompts index
  layoutSpec?: string
  abVariants?: string
}

export interface RefinementRequest {
  previousOutput: AdCreativeOutput
  feedback: SectionFeedback
}

export interface SavedCampaign {
  brandId: string
  brief: CampaignBrief
  output: AdCreativeOutput
  savedAt: string  // ISO timestamp
}
