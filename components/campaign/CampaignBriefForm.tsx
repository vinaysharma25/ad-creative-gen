'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CampaignBrief, CampaignReferenceImages, Platform } from '@/lib/types'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'meta_feed_square', label: 'Meta Feed — Square (1:1)' },
  { value: 'meta_feed_landscape', label: 'Meta Feed — Landscape (1.91:1)' },
  { value: 'meta_feed_portrait', label: 'Meta Feed — Portrait (4:5)' },
  { value: 'meta_story', label: 'Meta Story (9:16)' },
  { value: 'instagram_feed', label: 'Instagram Feed (1:1)' },
  { value: 'instagram_story', label: 'Instagram Story (9:16)' },
  { value: 'instagram_reel', label: 'Instagram Reel (9:16)' },
]

const schema = z.object({
  productName: z.string().min(1),
  productDescription: z.string().min(10),
  audienceSegment: z.string().min(5),
  emotionalAngle: z.string().min(5),
  offer: z.string().min(3),
  platform: z.enum([
    'meta_feed_square',
    'meta_feed_landscape',
    'meta_feed_portrait',
    'meta_story',
    'instagram_feed',
    'instagram_story',
    'instagram_reel',
  ]),
  objective: z.enum(['conversions', 'traffic', 'awareness', 'retargeting']),
  additionalContext: z.string(),
})

type FormValues = z.infer<typeof schema>

interface CampaignBriefFormProps {
  onSubmit: (brief: CampaignBrief, refs: CampaignReferenceImages) => void
  isGenerating?: boolean
}

export function CampaignBriefForm({ onSubmit, isGenerating }: CampaignBriefFormProps) {
  const [modelPreview, setModelPreview] = useState<string | undefined>()
  const [productPreview, setProductPreview] = useState<string | undefined>()
  const modelRef = useRef<HTMLInputElement>(null)
  const productRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: 'meta_feed_square',
      objective: 'conversions',
      additionalContext: '',
    },
  })

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(reader.result as string)
    reader.readAsDataURL(file)
  }

  function onFormSubmit(data: FormValues) {
    onSubmit(data, { model: modelPreview, productVariant: productPreview })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product & Offer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" {...register('productName')} placeholder="e.g. NightBloom Eye Serum" />
            {errors.productName && <p className="text-destructive text-xs mt-1">{errors.productName.message}</p>}
          </div>
          <div>
            <Label htmlFor="productDescription">Product Description</Label>
            <Textarea id="productDescription" {...register('productDescription')} placeholder="What does it do, key ingredients, format..." rows={3} />
            {errors.productDescription && <p className="text-destructive text-xs mt-1">{errors.productDescription.message}</p>}
          </div>
          <div>
            <Label htmlFor="offer">Offer / Angle</Label>
            <Input id="offer" {...register('offer')} placeholder="e.g. 30% off first order + free shipping" />
            {errors.offer && <p className="text-destructive text-xs mt-1">{errors.offer.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audience & Emotion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="audienceSegment">Audience Segment</Label>
            <Input id="audienceSegment" {...register('audienceSegment')} placeholder="e.g. Moms 35-50 with visible signs of fatigue" />
            {errors.audienceSegment && <p className="text-destructive text-xs mt-1">{errors.audienceSegment.message}</p>}
          </div>
          <div>
            <Label htmlFor="emotionalAngle">Emotional Angle</Label>
            <Textarea id="emotionalAngle" {...register('emotionalAngle')} placeholder="The core emotion we're tapping into — fear of aging, desire for confidence..." rows={2} />
            {errors.emotionalAngle && <p className="text-destructive text-xs mt-1">{errors.emotionalAngle.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform & Objective</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform</Label>
            <Select defaultValue="meta_feed_square" onValueChange={v => setValue('platform', v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Campaign Objective</Label>
            <Select defaultValue="conversions" onValueChange={v => setValue('objective', v as CampaignBrief['objective'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="awareness">Awareness</SelectItem>
                <SelectItem value="retargeting">Retargeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="additionalContext">Additional Context</Label>
            <Textarea id="additionalContext" {...register('additionalContext')} placeholder="Seasonal angle, recent news, competitor activity, any creative constraints..." rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reference Images (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <RefImageUpload
            label="Model / Talent"
            preview={modelPreview}
            inputRef={modelRef}
            onChange={e => handleImageUpload(e, setModelPreview)}
            onClear={() => setModelPreview(undefined)}
          />
          <RefImageUpload
            label="Product Variant"
            preview={productPreview}
            inputRef={productRef}
            onChange={e => handleImageUpload(e, setProductPreview)}
            onClear={() => setProductPreview(undefined)}
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isGenerating} className="w-full flex items-center gap-2">
        {isGenerating && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
        {isGenerating ? 'Generating…' : 'Generate Ad Creative'}
      </Button>
    </form>
  )
}

interface RefImageUploadProps {
  label: string
  preview?: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
}

function RefImageUpload({ label, preview, inputRef, onChange, onClear }: RefImageUploadProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div
        className="relative border border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
        onClick={() => !preview && inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="h-full w-full object-contain p-2" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onClear() }}
              className="absolute top-1 right-1 bg-background rounded-full p-0.5 border"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="text-xs">Upload reference</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  )
}
