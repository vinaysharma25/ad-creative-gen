import type { BrandDNA, SavedCampaign } from '@/lib/types'

const BRANDS_KEY = 'ad-creative-gen:brands'
const ACTIVE_BRAND_KEY = 'ad-creative-gen:activeBrandId'
const campaignKey = (brandId: string) => `ad-creative-gen:campaign:${brandId}`

export const storage = {
  getBrands(): BrandDNA[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(BRANDS_KEY)
      return raw ? (JSON.parse(raw) as BrandDNA[]) : []
    } catch {
      return []
    }
  },

  saveBrand(brand: BrandDNA): void {
    const brands = storage.getBrands()
    const idx = brands.findIndex(b => b.id === brand.id)
    if (idx >= 0) {
      brands[idx] = brand
    } else {
      brands.push(brand)
    }
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands))
  },

  deleteBrand(id: string): void {
    const brands = storage.getBrands().filter(b => b.id !== id)
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands))
    if (storage.getActiveBrandId() === id) {
      storage.setActiveBrandId(brands[0]?.id ?? null)
    }
  },

  getActiveBrandId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACTIVE_BRAND_KEY)
  },

  setActiveBrandId(id: string | null): void {
    if (id === null) {
      localStorage.removeItem(ACTIVE_BRAND_KEY)
    } else {
      localStorage.setItem(ACTIVE_BRAND_KEY, id)
    }
  },

  getActiveBrand(): BrandDNA | null {
    const id = storage.getActiveBrandId()
    if (!id) return null
    return storage.getBrands().find(b => b.id === id) ?? null
  },

  exportBrand(brand: BrandDNA): void {
    const json = JSON.stringify(brand, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brand-${brand.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  importBrand(json: string): BrandDNA {
    const brand = JSON.parse(json) as BrandDNA
    storage.saveBrand(brand)
    return brand
  },

  getCampaign(brandId: string): SavedCampaign | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(campaignKey(brandId))
      return raw ? (JSON.parse(raw) as SavedCampaign) : null
    } catch {
      return null
    }
  },

  saveCampaign(campaign: SavedCampaign): void {
    localStorage.setItem(campaignKey(campaign.brandId), JSON.stringify(campaign))
  },

  clearCampaign(brandId: string): void {
    localStorage.removeItem(campaignKey(brandId))
  },
}
