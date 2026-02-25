const MAX_PX = 512

/**
 * Resizes an image File/Blob to fit within MAX_PX on the longest side.
 * Returns a base64 data URL. Uses the canvas API — no external library.
 */
export async function resizeImage(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const { width, height } = img
      const scale = Math.min(1, MAX_PX / Math.max(width, height))
      const targetW = Math.round(width * scale)
      const targetH = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'))

      ctx.drawImage(img, 0, 0, targetW, targetH)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

/**
 * Extracts the base64 data string and media type from a data URL.
 * Returns null if the input is not a valid data URL.
 */
export function parseDataUrl(dataUrl: string): { mediaType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return { mediaType: match[1], data: match[2] }
}
