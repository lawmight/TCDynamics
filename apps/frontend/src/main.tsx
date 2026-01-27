import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'

// Dynamically load Facebook SDK to avoid Vite bundling issues
// This script is loaded after the app initializes to prevent build errors
if (typeof window !== 'undefined') {
  const loadFacebookSDK = () => {
    const script = document.createElement('script')
    script.src = '/scripts/facebook-sdk.js'
    script.defer = true
    script.type = 'text/javascript'
    document.body.appendChild(script)
  }

  // Load after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFacebookSDK)
  } else {
    loadFacebookSDK()
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
