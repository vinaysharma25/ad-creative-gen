'use client'

import { useState, useEffect, useCallback } from 'react'
import { storage } from '@/lib/storage'
import type { BrandDNA } from '@/lib/types'

export function useBrandProfiles() {
  const [brands, setBrands] = useState<BrandDNA[]>([])
  const [activeBrand, setActiveBrandState] = useState<BrandDNA | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = storage.getBrands()
    setBrands(stored)
    const active = storage.getActiveBrand()
    setActiveBrandState(active ?? stored[0] ?? null)
    if (!storage.getActiveBrandId() && stored[0]) {
      storage.setActiveBrandId(stored[0].id)
    }
  }, [])

  const saveBrand = useCallback((brand: BrandDNA) => {
    storage.saveBrand(brand)
    setBrands(storage.getBrands())
    // Auto-activate newly saved brand
    setActiveBrandState(brand)
    storage.setActiveBrandId(brand.id)
  }, [])

  const deleteBrand = useCallback((id: string) => {
    storage.deleteBrand(id)
    const remaining = storage.getBrands()
    setBrands(remaining)
    const newActive = storage.getActiveBrand() ?? remaining[0] ?? null
    setActiveBrandState(newActive)
    if (newActive) storage.setActiveBrandId(newActive.id)
    else storage.setActiveBrandId(null)
  }, [])

  const setActiveBrand = useCallback((brand: BrandDNA) => {
    setActiveBrandState(brand)
    storage.setActiveBrandId(brand.id)
  }, [])

  const exportBrand = useCallback((brand: BrandDNA) => {
    storage.exportBrand(brand)
  }, [])

  const importBrand = useCallback((json: string): BrandDNA => {
    const brand = storage.importBrand(json)
    setBrands(storage.getBrands())
    setActiveBrandState(brand)
    storage.setActiveBrandId(brand.id)
    return brand
  }, [])

  return {
    brands,
    activeBrand,
    saveBrand,
    deleteBrand,
    setActiveBrand,
    exportBrand,
    importBrand,
  }
}
