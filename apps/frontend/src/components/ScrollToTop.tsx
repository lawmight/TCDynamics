import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // If there's a hash, scroll to that element instead of top
    if (hash) {
      // Small delay to ensure DOM is ready after navigation
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(hash.slice(1))
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    } else {
      // No hash, scroll to top instantly
      // Use requestAnimationFrame to ensure DOM is ready after navigation
      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
      })
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop
