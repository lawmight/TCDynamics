import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    // Track 404 error in development
    if (import.meta.env.DEV) {
      // Log 404 error for debugging
    }
  }, [location.pathname])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mb-4 text-xl">
          Oops! Page not found
        </p>
        <a href="/" className="text-primary hover:text-primary/80 underline">
          Return to Home
        </a>
      </div>
    </div>
  )
}

export default NotFound
