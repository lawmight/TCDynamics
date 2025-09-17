// Service Worker Registration Utility
// Handles PWA installation and service worker lifecycle

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

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', () => {
        // Log messages from service worker for debugging (commented out for production)
        // console.log('📨 Message from service worker:', event.data)
      })
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  } else {
    console.warn('⚠️ Service Workers not supported in this browser')
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
      console.error('❌ Service Worker unregistration failed:', error)
    }
  }
}

// PWA Install Prompt Types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// PWA Install Prompt Handler
let deferredPrompt: BeforeInstallPromptEvent | null = null

export const setupInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
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
    console.warn('⚠️ No install prompt available')
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
    (window.navigator as any).standalone === true
  )
}

// Check if service worker is active
export const isServiceWorkerActive = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    return registration !== undefined && registration.active !== null
  }
  return false
}
