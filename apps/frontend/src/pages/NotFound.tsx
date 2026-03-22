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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md space-y-4 px-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oups, cette page est introuvable.
        </p>
        <a href="/" className="text-primary underline hover:text-primary/80">
          Retour à l'accueil
        </a>
      </div>
    </div>
  )
}

export default NotFound
