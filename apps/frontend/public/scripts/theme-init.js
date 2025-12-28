/**
 * Theme initialization script - moved from inline to external file
 * This prevents FOUC (Flash of Unstyled Content) by applying theme before page renders
 * Must be loaded synchronously in <head> before stylesheets
 */
;(function () {
  try {
    const theme = localStorage.getItem('theme') || 'system'
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme
    document.documentElement.classList.add(resolved)
  } catch (e) {
    // Fallback to light mode if localStorage is unavailable
    document.documentElement.classList.add('light')
  }
})()
