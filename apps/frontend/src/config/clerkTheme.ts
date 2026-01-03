import type { Appearance } from '@clerk/types'

/**
 * TC Dynamics Industrial Luxury theme for Clerk components
 * Maps your design system tokens to Clerk's appearance API
 */
export const clerkAppearance: Appearance = {
  variables: {
    // Primary - sky-500 (#0ea5e9)
    colorPrimary: '#0ea5e9',
    colorPrimaryForeground: '#ffffff',

    // Neutral/Background - Industrial Luxury warm cream
    colorBackground: '#f7f7f5', // 50 50% 97%
    colorForeground: '#1a1a1a', // Deep graphite
    colorNeutral: '#e5e5e0',
    colorMuted: '#e8e8e4',
    colorMutedForeground: '#666666',

    // States
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    colorWarning: '#f97316',

    // Typography
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem', // matches --radius

    // Input styling
    colorInput: '#f7f7f5',
    colorInputForeground: '#1a1a1a',
    colorBorder: '#d9d9d1',
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'iconButton',
  },
}

/**
 * Dark mode appearance overrides
 * Use this when your app is in dark mode
 */
export const clerkDarkAppearance: Appearance = {
  variables: {
    colorPrimary: '#0ea5e9',
    colorPrimaryForeground: '#ffffff',
    colorBackground: '#0a0a0a', // 0 0% 4%
    colorForeground: '#fafafa',
    colorNeutral: '#292929',
    colorMuted: '#292929',
    colorMutedForeground: '#a3a3a3',
    colorInput: '#292929',
    colorInputForeground: '#fafafa',
    colorBorder: '#292929',
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    colorWarning: '#f97316',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem',
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'iconButton',
  },
}
