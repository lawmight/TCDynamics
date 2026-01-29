import { useEffect, useRef } from 'react'

import { FacebookPixel } from 'react-meta-pixel'

import { setFacebookPixelInstance } from '@/utils/facebookEvents'

type UseFacebookPixelOptions = {
  enabled: boolean
  pixelId?: string
}

export const useFacebookPixel = ({
  enabled,
  pixelId,
}: UseFacebookPixelOptions) => {
  const pixelRef = useRef<FacebookPixel | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!enabled || !pixelId) {
      if (pixelRef.current) {
        pixelRef.current = null
        setFacebookPixelInstance(null)
      }
      return
    }

    if (pixelRef.current) return

    const pixel = new FacebookPixel({
      pixelID: pixelId,
      debug: import.meta.env.DEV,
      pageViewOnInit: true,
      autoConfig: true,
      disablePushState: false,
    })

    pixel.init({})
    pixelRef.current = pixel
    setFacebookPixelInstance(pixel)
  }, [enabled, pixelId])
}
