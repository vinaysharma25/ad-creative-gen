import type { Platform } from '@/lib/types'

export interface AdSize {
  width: number
  height: number
  aspectRatio: string       // for image generation APIs (e.g. "1:1")
  label: string
  safeZone: {
    top: number             // pixels from top to exclude
    bottom: number          // pixels from bottom to exclude
    left: number            // pixels from left to exclude
    right: number           // pixels from right to exclude
  }
  safeZoneDescription: string
}

export const AD_SIZES: Record<Platform, AdSize> = {
  meta_feed_square: {
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    label: 'Meta Feed — Square (1:1)',
    safeZone: { top: 151, bottom: 151, left: 151, right: 151 },
    safeZoneDescription: 'Keep all key content within 778×778px centered — 14% safe margin on all sides',
  },
  meta_feed_landscape: {
    width: 1200,
    height: 628,
    aspectRatio: '1.91:1',
    label: 'Meta Feed — Landscape (1.91:1)',
    safeZone: { top: 88, bottom: 88, left: 168, right: 168 },
    safeZoneDescription: 'Keep content within 864×452px centered — 14% safe margin on all sides',
  },
  meta_feed_portrait: {
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    label: 'Meta Feed — Portrait (4:5)',
    safeZone: { top: 189, bottom: 189, left: 151, right: 151 },
    safeZoneDescription: 'Keep content within 778×972px centered — 14% safe margin on all sides',
  },
  meta_story: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    label: 'Meta Story (9:16)',
    safeZone: { top: 250, bottom: 350, left: 0, right: 0 },
    safeZoneDescription: 'Avoid top 250px (UI chrome) and bottom 350px (CTA bar) — content safe zone: 250–1570px vertically',
  },
  instagram_feed: {
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    label: 'Instagram Feed (1:1)',
    safeZone: { top: 151, bottom: 151, left: 151, right: 151 },
    safeZoneDescription: 'Keep all key content within 778×778px centered — 14% safe margin on all sides',
  },
  instagram_story: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    label: 'Instagram Story (9:16)',
    safeZone: { top: 250, bottom: 350, left: 0, right: 0 },
    safeZoneDescription: 'Avoid top 250px (profile header) and bottom 350px (reply bar) — safe zone: 250–1570px vertically',
  },
  instagram_reel: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    label: 'Instagram Reel (9:16)',
    safeZone: { top: 250, bottom: 350, left: 0, right: 0 },
    safeZoneDescription: 'Avoid top 250px and bottom 350px — safe zone: 250–1570px vertically',
  },
}

export function getAdSize(platform: Platform): AdSize {
  return AD_SIZES[platform]
}

/** Returns CSS aspect-ratio value for use in style props */
export function getCssAspectRatio(platform: Platform): string {
  const { width, height } = AD_SIZES[platform]
  return `${width} / ${height}`
}

/** Returns safe zone as CSS padding shorthand (for preview overlays) */
export function getSafeZonePadding(platform: Platform): string {
  const { safeZone } = AD_SIZES[platform]
  return `${safeZone.top}px ${safeZone.right}px ${safeZone.bottom}px ${safeZone.left}px`
}
