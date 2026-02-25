'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BrandAssetUpload } from '@/components/brand/BrandAssetUpload'
import { cn } from '@/lib/utils'
import type { BrandDNA } from '@/lib/types'

const fieldArr = z.array(z.object({ value: z.string() }))

const schema = z.object({
  name: z.string().min(1, 'Required'),
  positioning: z.string().min(10, 'Min 10 chars'),
  toneOfVoice: fieldArr.min(1),
  brandPersonality: z.string().min(10, 'Min 10 chars'),
  targetAudiencePrimary: z.string().min(5, 'Required'),
  audiencePains: fieldArr.min(1),
  audienceDesires: fieldArr.min(1),
  audienceSophisticationLevel: z.enum(['unaware', 'problem-aware', 'solution-aware', 'aware']),
  primaryColors: fieldArr.min(1),
  visualStyle: z.string().min(5, 'Required'),
  imageryDont: fieldArr,
  forbiddenWords: fieldArr,
  powerWords: fieldArr,
  cta: fieldArr.min(1),
  competitorNames: fieldArr,
  differentiators: fieldArr.min(1),
  logo: z.string().optional(),
  heroShot: z.string().optional(),
  mascot: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function toArr(arr: string[]): { value: string }[] {
  return arr.length ? arr.map(v => ({ value: v })) : [{ value: '' }]
}
function fromArr(arr: { value: string }[]): string[] {
  return arr.map(f => f.value).filter(Boolean)
}

interface BrandDNAFormProps {
  onSubmit: (brand: BrandDNA) => void
  defaultValues?: Partial<BrandDNA>
}

export function BrandDNAForm({ onSubmit, defaultValues }: BrandDNAFormProps) {
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      positioning: defaultValues?.positioning ?? '',
      toneOfVoice: toArr(defaultValues?.toneOfVoice ?? ['Confident']),
      brandPersonality: defaultValues?.brandPersonality ?? '',
      targetAudiencePrimary: defaultValues?.targetAudiencePrimary ?? '',
      audiencePains: toArr(defaultValues?.audiencePains ?? ['']),
      audienceDesires: toArr(defaultValues?.audienceDesires ?? ['']),
      audienceSophisticationLevel: defaultValues?.audienceSophisticationLevel ?? 'problem-aware',
      primaryColors: toArr(defaultValues?.primaryColors ?? ['#000000']),
      visualStyle: defaultValues?.visualStyle ?? '',
      imageryDont: toArr(defaultValues?.imageryDont ?? []).filter(f => f.value),
      forbiddenWords: toArr(defaultValues?.forbiddenWords ?? []).filter(f => f.value),
      powerWords: toArr(defaultValues?.powerWords ?? []).filter(f => f.value),
      cta: toArr(defaultValues?.cta ?? ['Shop Now']),
      competitorNames: toArr(defaultValues?.competitorNames ?? []).filter(f => f.value),
      differentiators: toArr(defaultValues?.differentiators ?? ['']),
      logo: defaultValues?.assets?.logo,
      heroShot: defaultValues?.assets?.heroShot,
      mascot: defaultValues?.assets?.mascot,
    },
  })

  const tone = useFieldArray({ control, name: 'toneOfVoice' })
  const pains = useFieldArray({ control, name: 'audiencePains' })
  const desires = useFieldArray({ control, name: 'audienceDesires' })
  const colors = useFieldArray({ control, name: 'primaryColors' })
  const imageryDont = useFieldArray({ control, name: 'imageryDont' })
  const forbidden = useFieldArray({ control, name: 'forbiddenWords' })
  const power = useFieldArray({ control, name: 'powerWords' })
  const cta = useFieldArray({ control, name: 'cta' })
  const competitors = useFieldArray({ control, name: 'competitorNames' })
  const differentiators = useFieldArray({ control, name: 'differentiators' })

  const logo = watch('logo')
  const heroShot = watch('heroShot')
  const mascot = watch('mascot')

  function onFormSubmit(data: FormValues) {
    const brand: BrandDNA = {
      id: defaultValues?.id ?? crypto.randomUUID(),
      createdAt: defaultValues?.createdAt ?? new Date().toISOString(),
      name: data.name,
      positioning: data.positioning,
      toneOfVoice: fromArr(data.toneOfVoice),
      brandPersonality: data.brandPersonality,
      targetAudiencePrimary: data.targetAudiencePrimary,
      audiencePains: fromArr(data.audiencePains),
      audienceDesires: fromArr(data.audienceDesires),
      audienceSophisticationLevel: data.audienceSophisticationLevel,
      primaryColors: fromArr(data.primaryColors),
      visualStyle: data.visualStyle,
      imageryDont: fromArr(data.imageryDont),
      forbiddenWords: fromArr(data.forbiddenWords),
      powerWords: fromArr(data.powerWords),
      cta: fromArr(data.cta),
      competitorNames: fromArr(data.competitorNames),
      differentiators: fromArr(data.differentiators),
      assets: { logo: data.logo, heroShot: data.heroShot, mascot: data.mascot },
    }
    onSubmit(brand)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-8 rounded-none border-b border-border bg-transparent p-0">
          {(['identity', 'audience', 'visuals', 'copy', 'assets'] as const).map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="h-full rounded-none border-b-2 border-transparent text-[11px] font-mono uppercase tracking-widest text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* IDENTITY */}
        <TabsContent value="identity" className="pt-4 space-y-4">
          <Field label="Brand Name" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Acme Co." className="font-mono" />
          </Field>
          <Field label="Positioning Statement" error={errors.positioning?.message}>
            <Textarea {...register('positioning')} rows={3} placeholder="We help [audience] achieve [outcome] through [unique mechanism]..." />
          </Field>
          <Field label="Brand Personality" error={errors.brandPersonality?.message}>
            <Textarea {...register('brandPersonality')} rows={2} placeholder="Bold challenger brand that disrupts the category with radical transparency..." />
          </Field>
          <TagList label="Tone of Voice" fa={tone} name="toneOfVoice" register={register} placeholder="e.g. Confident" />
        </TabsContent>

        {/* AUDIENCE */}
        <TabsContent value="audience" className="pt-4 space-y-4">
          <Field label="Primary Audience" error={errors.targetAudiencePrimary?.message}>
            <Input {...register('targetAudiencePrimary')} placeholder="Women 25–40, fitness-conscious, urban..." />
          </Field>
          <Field label="Awareness / Sophistication Level">
            <Select
              defaultValue={defaultValues?.audienceSophisticationLevel ?? 'problem-aware'}
              onValueChange={v => setValue('audienceSophisticationLevel', v as BrandDNA['audienceSophisticationLevel'])}
            >
              <SelectTrigger className="font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unaware">Unaware — doesn't know they have the problem</SelectItem>
                <SelectItem value="problem-aware">Problem Aware — knows the pain, not the solution</SelectItem>
                <SelectItem value="solution-aware">Solution Aware — knows solutions exist, comparing</SelectItem>
                <SelectItem value="aware">Fully Aware — knows your brand, needs a push</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <TagList label="Audience Pains" fa={pains} name="audiencePains" register={register} placeholder="e.g. Constantly tired despite sleeping 8 hours" />
          <TagList label="Audience Desires" fa={desires} name="audienceDesires" register={register} placeholder="e.g. Boundless energy without caffeine crashes" />
          <TagList label="Differentiators vs Competitors" fa={differentiators} name="differentiators" register={register} placeholder="e.g. Only brand with clinically-tested formula" />
          <TagList label="Competitor Names" fa={competitors} name="competitorNames" register={register} placeholder="e.g. Brand X" />
        </TabsContent>

        {/* VISUALS */}
        <TabsContent value="visuals" className="pt-4 space-y-4">
          <TagList label="Primary Brand Colors (hex)" fa={colors} name="primaryColors" register={register} placeholder="#FF5733" />
          <Field label="Visual Style" error={errors.visualStyle?.message}>
            <Textarea {...register('visualStyle')} rows={2} placeholder="Clean minimalist, white space heavy, bold editorial typography, authentic photography..." />
          </Field>
          <TagList label="Imagery Don'ts" fa={imageryDont} name="imageryDont" register={register} placeholder="e.g. No staged stock photos" />
        </TabsContent>

        {/* COPY RULES */}
        <TabsContent value="copy" className="pt-4 space-y-4">
          <TagList label="Power Words" fa={power} name="powerWords" register={register} placeholder="e.g. Transform" />
          <TagList label="Forbidden Words" fa={forbidden} name="forbiddenWords" register={register} placeholder="e.g. Cheap" />
          <TagList label="Approved CTAs" fa={cta} name="cta" register={register} placeholder="e.g. Start Your Journey" />
        </TabsContent>

        {/* ASSETS */}
        <TabsContent value="assets" className="pt-4">
          <p className="text-[11px] font-mono text-muted-foreground mb-4 uppercase tracking-widest">
            Images resized to 512px before storage. Max 10MB each.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <BrandAssetUpload
              label="Logo"
              value={logo}
              onChange={v => setValue('logo', v)}
            />
            <BrandAssetUpload
              label="Hero Shot"
              value={heroShot}
              onChange={v => setValue('heroShot', v)}
            />
            <BrandAssetUpload
              label="Mascot"
              value={mascot}
              onChange={v => setValue('mascot', v)}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        className="w-full rounded-none font-mono text-xs uppercase tracking-widest h-9"
      >
        Save Brand DNA
      </Button>
    </form>
  )
}

/* ── Shared sub-components ── */

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-[10px] text-destructive font-mono">{error}</p>}
    </div>
  )
}

interface TagListProps {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fa: ReturnType<typeof useFieldArray<any, any, any>>
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: ReturnType<typeof useForm<any>>['register']
  placeholder?: string
}

function TagList({ label, fa, name, register, placeholder }: TagListProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</Label>
        <button
          type="button"
          onClick={() => fa.append({ value: '' })}
          className="flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" /> ADD
        </button>
      </div>
      <div className="space-y-1.5">
        {fa.fields.map((field, index) => (
          <div key={field.id} className="flex gap-1.5">
            <Input
              {...(register as (name: string) => object)(`${name}.${index}.value`)}
              placeholder={placeholder}
              className={cn('h-8 text-sm font-mono flex-1')}
            />
            {fa.fields.length > 1 && (
              <button
                type="button"
                onClick={() => fa.remove(index)}
                className="h-8 w-8 shrink-0 flex items-center justify-center border border-border rounded text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
