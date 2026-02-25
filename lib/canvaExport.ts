import type { AdCreativeOutput, CampaignBrief } from '@/lib/types'

interface CanvaRow {
  headline: string
  body: string
  cta: string
  hook: string
  framework: string
  platform: string
  variant: string
}

/**
 * Builds a CSV for Canva Bulk Create.
 * Columns map to Canva template variables: {{headline}}, {{body}}, {{cta}}, {{hook}}, {{framework}}, {{platform}}, {{variant}}
 *
 * Each row = one ad unit. Produces one row per copy framework × A/B variant combination.
 */
export function buildCanvaCSV(output: AdCreativeOutput, brief: CampaignBrief): string {
  const rows: CanvaRow[] = []
  const platform = brief.platform.replace(/_/g, ' ')

  const copyBlocks = [
    output.adCopy.problemAgitateCTA,
    output.adCopy.comparison,
    output.adCopy.mythBust,
  ]

  for (const variant of output.abVariants) {
    for (const block of copyBlocks) {
      rows.push({
        headline: block.headline,
        body: block.body,
        cta: block.cta,
        hook: variant.hook,
        framework: block.frameworkName,
        platform,
        variant: `Variant ${variant.variantId}`,
      })
    }
  }

  const headers = ['headline', 'body', 'cta', 'hook', 'framework', 'platform', 'variant']
  const csvRows = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => csvCell(row[h as keyof CanvaRow])).join(',')
    ),
  ]

  return csvRows.join('\n')
}

function csvCell(value: string): string {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

export function downloadCanvaCSV(output: AdCreativeOutput, brief: CampaignBrief): void {
  const csv = buildCanvaCSV(output, brief)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `canva-bulk-${brief.productName.toLowerCase().replace(/\s+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function buildMarkdownExport(output: AdCreativeOutput, brief: CampaignBrief): string {
  const lines: string[] = [
    `# Ad Creative — ${brief.productName}`,
    `**Platform:** ${brief.platform} | **Objective:** ${brief.objective}`,
    '',
    '## Hooks',
    ...output.hooks.map((h, i) =>
      `${i + 1}. **${h.text}**\n   - Technique: ${h.technique}\n   - Trigger: ${h.psychologicalTrigger}`
    ),
    '',
    '## Ad Copy',
    ...Object.values(output.adCopy).map(block => [
      `### ${block.frameworkName}`,
      `**Headline:** ${block.headline}`,
      `**Body:** ${block.body}`,
      `**CTA:** ${block.cta}`,
      '',
    ].join('\n')),
    '## Image Prompts',
    ...output.imagePrompts.map(p => [
      `### ${p.purpose}`,
      `**Prompt:** ${p.prompt}`,
      `**Negative:** ${p.negativePrompt}`,
      `**Aspect Ratio:** ${p.aspectRatio}`,
      '',
    ].join('\n')),
    '## Layout Spec',
    `**Dimensions:** ${output.layoutSpec.platformDimensions}`,
    `**Safe Zone:** ${output.layoutSpec.safeZone}`,
    `**CTA Placement:** ${output.layoutSpec.ctaPlacement}`,
    `**Color Usage:** ${output.layoutSpec.colorUsage}`,
    `**Text Hierarchy:**`,
    ...output.layoutSpec.textHierarchy.map(t => `- ${t}`),
    `**Moodboard:** ${output.layoutSpec.moodboardKeywords.join(', ')}`,
    '',
    '## A/B Variants',
    ...output.abVariants.map(v => [
      `### Variant ${v.variantId}`,
      `**Hypothesis:** ${v.hypothesis}`,
      `**Hook:** ${v.hook}`,
      `**Differentiator:** ${v.differentiator}`,
      '',
    ].join('\n')),
  ]
  return lines.join('\n')
}

export function downloadMarkdownExport(output: AdCreativeOutput, brief: CampaignBrief): void {
  const md = buildMarkdownExport(output, brief)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ad-creative-${brief.productName.toLowerCase().replace(/\s+/g, '-')}.md`
  a.click()
  URL.revokeObjectURL(url)
}
