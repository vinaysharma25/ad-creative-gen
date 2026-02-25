'use client'

import { useState } from 'react'
import { RefreshCw, Download, FileText, RotateCcw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HooksSection } from '@/components/output/HooksSection'
import { AdCopySection } from '@/components/output/AdCopySection'
import { ABVariantsSection } from '@/components/output/ABVariantsSection'
import { LayoutSpecSection } from '@/components/output/LayoutSpecSection'
import { ImagePromptsSection } from '@/components/output/ImagePromptsSection'
import { AdPreview } from '@/components/output/AdPreview'
import { cn } from '@/lib/utils'
import { downloadCanvaCSV, downloadMarkdownExport } from '@/lib/canvaExport'
import type { AdCreativeOutput, BrandDNA, CampaignBrief, CampaignReferenceImages, SectionFeedback } from '@/lib/types'

interface OutputPanelProps {
  output: AdCreativeOutput
  previousOutput?: AdCreativeOutput
  brief: CampaignBrief
  brand?: BrandDNA
  refs?: CampaignReferenceImages
  isRefining: boolean
  onRefine: (feedback: SectionFeedback) => void
  onReset: () => void
}

const TABS = ['hooks', 'copy', 'images', 'layout', 'ab'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  hooks:  'Hooks',
  copy:   'Copy',
  images: 'Images',
  layout: 'Layout',
  ab:     'A/B',
}

export function OutputPanel({ output, previousOutput, brief, brand, refs, isRefining, onRefine, onReset }: OutputPanelProps) {
  const [feedback, setFeedback] = useState<SectionFeedback>({})
  const [activeTab, setActiveTab] = useState<Tab>('hooks')

  const hasFeedback = Object.values(feedback).some(v =>
    v !== undefined && v !== '' && (typeof v !== 'object' || Object.keys(v as object).length > 0)
  )

  function updateFeedback(key: keyof SectionFeedback, value: string) {
    setFeedback(prev => ({ ...prev, [key]: value }))
  }

  function updatePerImageFeedback(index: number, value: string) {
    setFeedback(prev => ({
      ...prev,
      perImageFeedback: { ...prev.perImageFeedback, [index]: value },
    }))
  }

  function handleRefine() {
    onRefine(feedback)
    setFeedback({})
  }

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="border-b border-border px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Output</span>
          {previousOutput && (
            <span className="text-[10px] font-mono text-amber-600 border border-amber-600/30 px-1.5 py-0.5">
              Refined
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => downloadMarkdownExport(output, brief)}
            className="h-7 px-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            title="Export as Markdown"
          >
            <FileText className="h-3 w-3" />
            MD
          </button>
          <button
            onClick={() => downloadCanvaCSV(output, brief)}
            className="h-7 px-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            title="Export Canva Bulk Create CSV"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>
          <button
            onClick={onReset}
            className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            title="Start over"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as Tab)} className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="w-full grid grid-cols-5 h-8 rounded-none border-b border-border bg-transparent p-0 shrink-0">
          {TABS.map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="h-full rounded-none border-b-2 border-transparent text-[11px] font-mono uppercase tracking-widest text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <TabsContent value="hooks" className="mt-0">
              <HooksSection
                hooks={output.hooks}
                feedback={feedback.hooks}
                onFeedbackChange={v => updateFeedback('hooks', v)}
              />
            </TabsContent>

            <TabsContent value="copy" className="mt-0">
              <AdCopySection
                adCopy={output.adCopy}
                feedback={feedback.adCopy}
                onFeedbackChange={v => updateFeedback('adCopy', v)}
              />
            </TabsContent>

            <TabsContent value="images" className="mt-0">
              <ImagePromptsSection
                imagePrompts={output.imagePrompts}
                globalFeedback={feedback.imagePrompts}
                perImageFeedback={feedback.perImageFeedback}
                onGlobalFeedbackChange={v => updateFeedback('imagePrompts', v)}
                onPerImageFeedbackChange={updatePerImageFeedback}
                refs={refs}
              />
            </TabsContent>

            <TabsContent value="layout" className="mt-0">
              <div className="space-y-4">
                <AdPreview output={output} brief={brief} brand={brand} />
                <LayoutSpecSection
                  spec={output.layoutSpec}
                  feedback={feedback.layoutSpec}
                  onFeedbackChange={v => updateFeedback('layoutSpec', v)}
                />
              </div>
            </TabsContent>

            <TabsContent value="ab" className="mt-0">
              <ABVariantsSection
                variants={output.abVariants}
                feedback={feedback.abVariants}
                onFeedbackChange={v => updateFeedback('abVariants', v)}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Refine footer — only shown when feedback exists */}
      {hasFeedback && (
        <div className="border-t border-border px-4 py-3 shrink-0 bg-background">
          <button
            onClick={handleRefine}
            disabled={isRefining}
            className={cn(
              'w-full h-9 flex items-center justify-center gap-2',
              'text-[11px] font-mono uppercase tracking-widest',
              'border border-foreground bg-foreground text-background',
              'hover:bg-background hover:text-foreground transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefining && 'animate-spin')} />
            {isRefining ? 'Refining…' : 'Refine Output with Feedback'}
          </button>
        </div>
      )}
    </div>
  )
}
