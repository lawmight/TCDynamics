// Service Worker Registration Utility
// Handles PWA installation and service worker lifecycle

import { logger } from './logger'

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      // // console.log('✅ Service Worker registered successfully:', registration.scope);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New content is available, notify user
              // // console.log('🔄 New content is available and will be used when all tabs for this page are closed.');
            }
          })
        }
      })

      navigator.serviceWorker.addEventListener('message', () => {
        // Log messages from service worker for debugging (commented out for production)
        // console.log('📨 Message from service worker:', event.data)
      })
    } catch (error) {
      logger.error('Service Worker registration failed', { error })
    }
  } else {
    logger.warn('Service Workers not supported in this browser')
  }
}

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      const result = await registration.unregister()
      if (result) {
        // // console.log('✅ Service Worker unregistered successfully');
      }
    } catch (error) {
      logger.error('Service Worker unregistration failed', { error })
    }
  }
}

// PWA Installation
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

// Listen for the beforeinstallprompt event
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent

    // // console.log('📱 PWA install prompt available');
  })

  window.addEventListener('appinstalled', () => {
    // // console.log('✅ PWA installed successfully');
    deferredPrompt = null
  })
}

export const triggerInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    logger.warn('No install prompt available')
    return false
  }

  // Show the install prompt
  deferredPrompt.prompt()

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice

  // // console.log(`📱 User response to install prompt: ${outcome}`);

  // Clear the deferred prompt
  deferredPrompt = null

  return outcome === 'accepted'
}

// Check if app is running as PWA
export const isPWA = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  )
}

// Check if service worker is active
export const isServiceWorkerActive = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    return registration?.active !== null
  }
  return false
}
