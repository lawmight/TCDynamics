// CSRF token utility functions

let csrfToken: string | null = null

export const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/csrf-token`
    )
    if (response.ok) {
      const data = await response.json()
      csrfToken = data.csrfToken
      return csrfToken
    }
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error)
  }

  return ''
}

export const clearCsrfToken = () => {
  csrfToken = null
}
