# Ad Creative Gen — Project Guide

## What This Is
A Next.js app that acts as an AI-powered ad creative director. Given a brand's identity (Brand DNA) and a campaign brief, it generates:
- 5 scroll-stopping hooks with psychological framing
- 3 ad copy blocks (Problem-Agitate-CTA, Before/After, Myth Bust)
- 3 image prompts (hero, lifestyle, text-overlay)
- A platform-specific layout spec
- 3 A/B test variants

Images can then be generated from those prompts using Gemini, Ideogram, or Flux (Fal AI), with an influence strength slider per image.

Final output can be exported as a Canva Bulk Create CSV.

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, RSC enabled)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style, neutral base, lucide icons)
- **AI — Copy**: Anthropic SDK — model: `claude-sonnet-4-6`
- **AI — Images**:
  - Gemini (`@google/generative-ai`) — primary; best text-in-image, free tier
  - Ideogram (REST) — fallback / style variants; 25 free/month
  - Flux Schnell via Fal AI (`@fal-ai/client`) — photorealistic people/product shots
- **Forms**: react-hook-form + zod
- **Fonts**: Geist Sans / Geist Mono
- **Toasts**: sonner
- **Persistence**: localStorage only (no database)
- **Package manager**: npm

---

## Image Generation Routing Logic
Implemented in `hooks/useImageGeneration.ts`:
- Text-overlay ads → Gemini (primary, free)
- Photorealistic model/people shots → Flux Schnell
- Fallback / style variants → Ideogram
- No API keys present → show prompts only, no generate buttons

Each image prompt has an **influence strength slider (0.2–0.9)** controlling how closely the output follows a reference image.

---

## Layout — Two-Column Shell

```
┌─────────────────────────────────────────────────────────┐
│  [BrandSwitcher ▾]                        [+ New Brand]  │
├──────────────────────┬──────────────────────────────────┤
│  LEFT                │  RIGHT                           │
│                      │                                  │
│  BrandDNAPreview     │  OutputPanel                     │
│  (collapsible)       │  Tabs: Hooks | Copy | Images |   │
│                      │        Layout | A/B              │
│  CampaignBriefForm   │                                  │
│  + ReferenceUploads  │  [Export All MD] [Canva CSV ↓]   │
│                      │                                  │
│  [Generate ▶]        │                                  │
└──────────────────────┴──────────────────────────────────┘
```

---

## Folder Structure

```
app/
  layout.tsx
  page.tsx                          # Two-column shell (client component, holds all state)
  globals.css
  api/
    generate/route.ts               # POST — Claude copy generation proxy
    image/
      gemini/route.ts               # POST — Gemini image gen proxy
      ideogram/route.ts             # POST — Ideogram proxy
      flux/route.ts                 # POST — Flux (fal.ai) proxy

components/
  brand/
    BrandSwitcher.tsx               # Dropdown to switch between saved brands + New Brand button
    BrandDNAForm.tsx                # 5 tabs: Identity | Audience | Visuals | Copy Rules | Assets
    BrandAssetUpload.tsx            # File → resize → localStorage → thumbnail preview
    BrandDNAPreview.tsx             # Collapsed read-only summary of active brand
  campaign/
    CampaignBriefForm.tsx           # Product, offer, audience, platform, objective
    ReferenceImageUpload.tsx        # Model + product variant (session state only)
  output/
    OutputPanel.tsx                 # Master tabs + Export All MD + Canva CSV download
    HooksSection.tsx                # 5 hooks with technique + psychological trigger chips
    AdCopySection.tsx               # 3 copy frameworks with copy buttons
    ImagePromptsSection.tsx         # Prompts + influence slider + [Gemini|Ideogram|Flux] buttons
    AdPreview.tsx                   # CSS-only layout preview with safe zone overlays
    LayoutSpecSection.tsx           # Platform dims, safe zone, text hierarchy, moodboard
    ABVariantsSection.tsx           # 3 variants with hypothesis + differentiator
    CopyButton.tsx                  # Reusable icon button that copies text to clipboard

hooks/
  useBrandProfiles.ts               # localStorage CRUD + active brand state
  useAdGeneration.ts                # Claude fetch + JSON parse + loading state
  useImageGeneration.ts             # Routes to Gemini / Ideogram / Flux + influence strength

lib/
  types.ts                          # All TypeScript interfaces
  utils.ts                          # cn() helper
  adSizes.ts                        # Platform dimensions + safe zone constants
  imageResize.ts                    # Canvas-based resize to 512px (no library)
  canvaExport.ts                    # CSV builder for Canva Bulk Create
  prompts.ts                        # buildSystemPrompt(brand) + buildUserPrompt(brief, platformSpec)
  storage.ts                        # Typed localStorage wrapper
```

---

## Core Data Types (`lib/types.ts`)
- `BrandDNA` — persisted brand identity (positioning, tone, colors, assets as base64 at 512px)
- `CampaignBrief` — per-campaign inputs (product, audience, platform, objective)
- `CampaignReferenceImages` — session-only model/product reference images (base64, NOT persisted)
- `AdCreativeOutput` — full generated output (hooks, adCopy, imagePrompts, layoutSpec, abVariants)
- `Platform` — `meta_feed_square | meta_feed_landscape | meta_feed_portrait | meta_story | instagram_feed | instagram_story | instagram_reel`
- `ImageProvider` — `'gemini' | 'ideogram' | 'flux'`

---

## Platform Ad Sizes (`lib/adSizes.ts`)

| Platform | Dimensions | Safe Zone |
|---|---|---|
| Meta Feed Square | 1080×1080 | 14% all sides |
| Meta Feed Landscape | 1200×628 | 14% all sides |
| Meta Feed Portrait | 1080×1350 | 14% all sides |
| Meta / IG Story | 1080×1920 | Top 250px + Bottom 350px excluded |
| Instagram Reel | 1080×1920 | Top 250px + Bottom 350px excluded |

---

## Claude Prompt Architecture (`lib/prompts.ts`)
Prompts live in `lib/prompts.ts`, NOT inlined in the API route.

- `buildSystemPrompt(brand: BrandDNA)` — entire Brand DNA as structured context; Claude "becomes" the brand
- `buildUserPrompt(brief: CampaignBrief, platformSpec)` — lean campaign brief + correct pixel dimensions from `adSizes.ts`

API route (`app/api/generate/route.ts`) imports and calls these — it is a thin proxy only.

**Output format**: JSON only. Parse error fallback: extract between first `{` and last `}`.

---

## Feedback & Refinement Loop

Users can leave feedback at two levels, both feeding into a single **full re-generation** via Claude:

### Per-section feedback (inline)
- Each output section (Hooks, Copy, Images, Layout, A/B) has a small collapsible feedback textarea
- Image prompt cards have a feedback field on the raw prompt **and** again on the generated image result
- Feedback is held in React state — not sent anywhere until the user triggers refinement

### Full loop refinement
- OutputPanel shows a "Refine Output" button once any feedback has been entered
- On click: original brand + brief + current `AdCreativeOutput` + all collected feedback notes → sent to Claude
- Claude re-generates the **entire** `AdCreativeOutput` with corrections applied
- Previous output is preserved in state so user can compare before/after

### Data shape additions (add to `lib/types.ts`)
```typescript
interface SectionFeedback {
  hooks?: string
  adCopy?: string
  imagePrompts?: string   // global image feedback
  perImageFeedback?: Record<number, string>  // keyed by imagePrompts index
  layoutSpec?: string
  abVariants?: string
}
```

### API change
`POST /api/generate` accepts an optional `refinement` field:
```typescript
{ brand, brief, refs, refinement?: { previousOutput: AdCreativeOutput, feedback: SectionFeedback } }
```
`buildUserPrompt` in `lib/prompts.ts` detects refinement mode and appends the previous output + all feedback to the prompt.

---

## API Routes

### POST /api/generate
- Input: `{ brand: BrandDNA, brief: CampaignBrief, refs: CampaignReferenceImages, refinement?: { previousOutput: AdCreativeOutput, feedback: SectionFeedback } }`
- First-run: standard generation
- Refinement run: Claude receives previous output + all section feedback, re-generates entire `AdCreativeOutput`
- Returns: `AdCreativeOutput`

### POST /api/image/gemini
- Input: `{ prompt, negativePrompt, aspectRatio, referenceImage?: string, influenceStrength: number }`
- Returns: `{ url: string }` (base64 data URL)

### POST /api/image/ideogram
- Input: `{ prompt, negativePrompt, aspectRatio }`
- Returns: `{ url: string }`

### POST /api/image/flux
- Input: `{ prompt, negativePrompt, aspectRatio, referenceImage?: string, influenceStrength: number }`
- Returns: `{ url: string }`

---

## Reference Image Handling
### Brand-level (persisted in localStorage via `lib/storage.ts`)
- Logo, hero product shot, brand mascot
- Resized client-side to max 512px using `lib/imageResize.ts` (canvas API, no library)
- Included automatically in every generation for that brand

### Campaign-level (session state only — gone on page close)
- Model / talent photo, specific product variant
- Held in React state in `page.tsx`

---

## Canva CSV Export (`lib/canvaExport.ts`)
Exports a CSV where columns match Canva template variable names (`{{headline}}`, `{{body}}`, `{{cta}}`, `{{hook}}`). User builds a Canva template once, uploads CSV → Bulk Create → all variants render.

```
headline,body,cta,hook,platform
"Japan costs less...","Full copy...","Book Free Call","Stop scrolling...","Story"
```

---

## Ad Preview (`components/output/AdPreview.tsx`)
CSS-only div at correct aspect ratio. Shows:
- Brand `primaryColors[0]` as background
- Actual generated headline + CTA
- Semi-transparent red safe zone overlays
- Platform switcher (Square / Story / Portrait)

Not a design tool — a layout sanity check before Canva.

---

## Environment Variables (`.env.local`)
```
ANTHROPIC_API_KEY=        # Required
GOOGLE_AI_API_KEY=        # Gemini image gen (free tier at AI Studio)
IDEOGRAM_API_KEY=         # Optional fallback
FAL_API_KEY=              # Optional for Flux photorealistic
```

---

## Claude Skills — When to Use

| Skill | Command | When to invoke |
|---|---|---|
| **frontend-design** | `/frontend-design` | Every UI component build — BrandDNAForm, CampaignBriefForm, all output sections, AdPreview, page shell. Ensures production-grade, distinctive aesthetics — no generic AI slop. |
| **feature-dev** | `/feature-dev` | Before starting a non-trivial feature (e.g. refinement loop, image generation flow). Runs codebase exploration + clarifying questions + architecture design before coding. |
| **code-review** | `/code-review` | After each phase is complete. Review for CLAUDE.md compliance, bugs, and pattern consistency. |
| **code-simplifier** | `/code-simplifier` | After the full build is done. Remove unnecessary complexity before deploy. |

### Skill usage rules
- **Never build a UI component without invoking `/frontend-design` first** — it sets the aesthetic direction
- Run `/code-review` at end of Phase 4 (Claude integration), Phase 5 (output UI), and Phase 6 (image layer)
- `/feature-dev` is optional but recommended for Phase 6 (image generation routing) and the refinement loop

---

## Conventions
- `'use client'` at top of all client components
- API routes are thin proxies — business logic lives in `lib/`
- Prompts in `lib/prompts.ts`, not in API routes
- Forms use react-hook-form + zod — no uncontrolled inputs
- Images stored as base64 data URLs, resized to 512px before localStorage
- Use `cn()` from `lib/utils` for conditional class merging
- shadcn components in `components/ui/` — never edit directly
- No database — localStorage is the only persistence layer
- Run `npm run dev` to start dev server

---

## Implementation Phases

**Phase 1 — Scaffold** ✅
- create-next-app + shadcn init + install deps
- `lib/types.ts` written

**Phase 2 — Data & Utilities**
- `lib/storage.ts` — typed localStorage wrapper
- `lib/imageResize.ts` — canvas resize to 512px
- `lib/adSizes.ts` — platform dimensions + safe zones
- `lib/prompts.ts` — buildSystemPrompt + buildUserPrompt
- `lib/canvaExport.ts` — Canva CSV builder
- `hooks/useBrandProfiles.ts` — localStorage CRUD + active brand

**Phase 3 — Brand DNA Form**
- Reusable `TagInput` component
- `BrandAssetUpload.tsx`
- `BrandDNAForm.tsx` (5 tabs: Identity, Audience, Visuals, Copy Rules, Assets)
- `BrandSwitcher.tsx` + `BrandDNAPreview.tsx`

**Phase 4 — Claude Integration**
- `app/api/generate/route.ts` (thin proxy, imports from `lib/prompts.ts`)
- `hooks/useAdGeneration.ts`
- Test with curl before building UI

**Phase 5 — Campaign Form + Core Output**
- `CampaignBriefForm.tsx`
- `ReferenceImageUpload.tsx`
- `HooksSection.tsx`, `AdCopySection.tsx`, `ABVariantsSection.tsx`
- `OutputPanel.tsx` (tabs + Export All MD + Canva CSV download)

**Phase 6 — Visual & Image Layer**
- `AdPreview.tsx` + `LayoutSpecSection.tsx`
- `app/api/image/gemini/route.ts`
- `app/api/image/ideogram/route.ts`
- `app/api/image/flux/route.ts`
- `hooks/useImageGeneration.ts`
- `ImagePromptsSection.tsx` (thumbnails + influence slider + 3 generate buttons)

**Phase 7 — Polish & Deploy**
- Export Brand Profile JSON download
- Error states, empty states, mobile layout
- `vercel deploy --prod`

---

## Verification Checklist
- Brand created → reload → persists in localStorage (including asset thumbnails)
- Generate → loading spinner → output populates all 5 tabs
- Forbidden words absent from all generated copy
- AdPreview renders correct aspect ratio + red safe zone overlays per platform
- Gemini generates image from prompt alone (no reference)
- Gemini generates image using uploaded product/model reference
- Influence slider at 0.9 stays close to reference; 0.2 is more creative
- Canva CSV downloads with correct columns → upload to Canva Bulk Create → variants render
- Switch brands → different system prompt → different voice in output
- Vercel prod deploy → all API routes respond correctly
