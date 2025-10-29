import { useState, useRef, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  onLoad?: () => void
}

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!loaded && (
        <div
          className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded"
          style={{
            width: width || '100%',
            height: height || 200,
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          className={`transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  )
}
