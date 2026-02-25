'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { BrandDNAForm } from '@/components/brand/BrandDNAForm'
import { BrandDNAPreview } from '@/components/brand/BrandDNAPreview'
import { BrandSwitcher } from '@/components/brand/BrandSwitcher'
import { CampaignBriefForm } from '@/components/campaign/CampaignBriefForm'
import { OutputPanel } from '@/components/output/OutputPanel'
import { useBrandProfiles } from '@/hooks/useBrandProfiles'
import { useAdGeneration } from '@/hooks/useAdGeneration'
import type { AdCreativeOutput, BrandDNA, CampaignBrief, CampaignReferenceImages, SectionFeedback } from '@/lib/types'

type LeftPanel = 'brand-form' | 'brand-preview'

export default function Home() {
  const { brands, activeBrand, saveBrand, deleteBrand, setActiveBrand, exportBrand, importBrand } =
    useBrandProfiles()

  const { state, generate, refine, reset } = useAdGeneration()

  const [leftPanel, setLeftPanel] = useState<LeftPanel>('brand-form')
  // Persist brief + refs so refine can re-use them
  const [lastBrief, setLastBrief] = useState<CampaignBrief | null>(null)
  const [lastRefs, setLastRefs] = useState<CampaignReferenceImages>({})
  // Keep last output in local state so OutputPanel stays visible during refinement
  const [lastOutput, setLastOutput] = useState<{ output: AdCreativeOutput; previousOutput?: AdCreativeOutput } | null>(null)
  const [isRefining, setIsRefining] = useState(false)

  function handleBrandSave(brand: BrandDNA) {
    saveBrand(brand)
    setLeftPanel('brand-preview')
  }

  async function handleGenerate(brief: CampaignBrief, refs: CampaignReferenceImages) {
    if (!activeBrand) return
    setLastBrief(brief)
    setLastRefs(refs)
    await generate(activeBrand, brief, refs)
    // state is updated inside the hook — sync lastOutput after generation
  }

  async function handleRefine(feedback: SectionFeedback) {
    if (!activeBrand || !lastBrief || !lastOutput) return
    setIsRefining(true)
    await refine(activeBrand, lastBrief, lastRefs, lastOutput.output, feedback)
    setIsRefining(false)
  }

  function handleReset() {
    reset()
    setLastOutput(null)
  }

  // Sync lastOutput from hook state so we have it during refinement transitions
  useEffect(() => {
    if (state.status === 'done') {
      setLastOutput({ output: state.output, previousOutput: state.previousOutput })
    }
  }, [state])

  const showOutput = lastOutput !== null && (state.status === 'done' || isRefining)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border px-4 h-10 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          Ad Creative Gen
        </span>
        <BrandSwitcher
          brands={brands}
          activeBrand={activeBrand}
          onSelect={setActiveBrand}
          onNew={() => setLeftPanel('brand-form')}
          onExport={exportBrand}
          onImport={importBrand}
          onDelete={deleteBrand}
        />
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Brand + Campaign */}
        <aside className="w-[420px] shrink-0 border-r border-border flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4">
            {activeBrand && leftPanel === 'brand-preview' && (
              <BrandDNAPreview
                brand={activeBrand}
                onEdit={() => setLeftPanel('brand-form')}
              />
            )}

            {leftPanel === 'brand-form' && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  {activeBrand ? 'Edit Brand DNA' : 'New Brand DNA'}
                </p>
                <BrandDNAForm
                  onSubmit={handleBrandSave}
                  defaultValues={activeBrand ?? undefined}
                />
              </div>
            )}

            {activeBrand && leftPanel === 'brand-preview' && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Campaign Brief
                </p>
                <CampaignBriefForm
                  onSubmit={handleGenerate}
                  isGenerating={state.status === 'generating' && !isRefining}
                />
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT — Output */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {state.status === 'idle' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Output Panel
                </p>
                <p className="text-[11px] text-muted-foreground/50">
                  {activeBrand
                    ? 'Fill in the campaign brief and click Generate'
                    : 'Start by creating a Brand DNA profile on the left'}
                </p>
              </div>
            </div>
          )}

          {state.status === 'generating' && !isRefining && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Generating…
                </p>
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3 max-w-sm">
                <AlertCircle className="h-5 w-5 text-destructive mx-auto" />
                <p className="text-[11px] font-mono uppercase tracking-widest text-destructive">
                  Generation Failed
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{state.message}</p>
                <button
                  onClick={handleReset}
                  className="text-[10px] font-mono uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground hover:text-foreground transition-colors text-muted-foreground"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {showOutput && (
            <OutputPanel
              output={lastOutput.output}
              previousOutput={lastOutput.previousOutput}
              brief={lastBrief!}
              brand={activeBrand ?? undefined}
              refs={lastRefs}
              isRefining={isRefining}
              onRefine={handleRefine}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  )
}
