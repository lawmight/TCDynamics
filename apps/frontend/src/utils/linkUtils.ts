const getBaseOrigin = () => {
  const fallback = 'https://tcdynamics.fr'
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || fallback

  try {
    return new URL(frontendUrl).origin
  } catch {
    return fallback
  }
}

export const isExternalLink = (url: string) => {
  if (!url) return false
  if (url.startsWith('#')) return false
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false

  try {
    const baseOrigin = getBaseOrigin()
    return new URL(url).origin !== baseOrigin
  } catch {
    return false
  }
}

export const getExternalLinkProps = (url: string) => {
  if (!isExternalLink(url)) return {}

  return {
    rel: 'noopener noreferrer nofollow',
    target: '_blank',
  }
}
