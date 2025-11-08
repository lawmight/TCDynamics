// CSRF token utility functions

let csrfToken: string | null = null

export const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken
  }

  try {
    // Use relative URL for API calls to work on any deployment
    const response = await fetch(`/api/csrf-token`)
    if (response.ok) {
      const data = await response.json()
      csrfToken = data.csrfToken
      return csrfToken
    }
  } catch {
    // Silently handle CSRF token fetch errors
  }

  return ''
}

export const clearCsrfToken = () => {
  csrfToken = null
}
