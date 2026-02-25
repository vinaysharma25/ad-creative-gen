'use client'

import { useState } from 'react'
import { BrandDNAForm } from '@/components/brand/BrandDNAForm'
import { BrandDNAPreview } from '@/components/brand/BrandDNAPreview'
import { BrandSwitcher } from '@/components/brand/BrandSwitcher'
import { CampaignBriefForm } from '@/components/campaign/CampaignBriefForm'
import { useBrandProfiles } from '@/hooks/useBrandProfiles'
import type { BrandDNA, CampaignBrief, CampaignReferenceImages } from '@/lib/types'

type LeftPanel = 'brand-form' | 'brand-preview'

export default function Home() {
  const { brands, activeBrand, saveBrand, deleteBrand, setActiveBrand, exportBrand, importBrand } =
    useBrandProfiles()

  const [leftPanel, setLeftPanel] = useState<LeftPanel>('brand-form')

  function handleBrandSave(brand: BrandDNA) {
    saveBrand(brand)
    setLeftPanel('brand-preview')
  }

  function handleGenerate(_brief: CampaignBrief, _refs: CampaignReferenceImages) {
    // Wired up in Phase 7 — output panel not yet built
    alert('Output panel coming in Phase 5–6. Brand DNA + brief captured successfully.')
  }

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
                <CampaignBriefForm onSubmit={handleGenerate} />
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT — Output placeholder */}
        <main className="flex-1 flex items-center justify-center">
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
        </main>
      </div>
    </div>
  )
}
