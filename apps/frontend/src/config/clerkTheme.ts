import type { Appearance } from '@clerk/types'

/**
 * TC Dynamics Industrial Luxury theme for Clerk components
 * Maps your design system tokens to Clerk's appearance API
 *
 * Based on Clerk's Appearance API best practices:
 * - Uses CSS variables for dynamic theming support
 * - Maps to your Tailwind design tokens
 * - Supports light/dark mode switching
 * - Aligns with Industrial Luxury aesthetic
 */
export const clerkAppearance: Appearance = {
  variables: {
    // Primary - sky-500 (#0ea5e9) - matches your --primary
    colorPrimary: 'hsl(var(--primary))',
    colorPrimaryForeground: 'hsl(var(--primary-foreground))',

    // Background & Foreground - Industrial Luxury warm cream
    colorBackground: 'hsl(var(--background))',
    colorForeground: 'hsl(var(--foreground))',

    // Neutral colors - mapped to your muted/secondary tokens
    colorNeutral: 'hsl(var(--muted))',
    colorMuted: 'hsl(var(--muted))',
    colorMutedForeground: 'hsl(var(--muted-foreground))',

    // States - matches your design system
    colorDanger: 'hsl(var(--destructive))',
    colorDangerForeground: 'hsl(var(--destructive-foreground))',
    colorSuccess: '#22c55e',
    colorWarning: '#f97316',

    // Typography - matches your Inter font family
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem', // 14px base
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },

    // Border radius - matches your --radius (0.5rem = 8px, but using 0.75rem for consistency)
    borderRadius: '0.75rem',

    // Input styling - matches your input tokens
    colorInput: 'hsl(var(--input))',
    colorInputText: 'hsl(var(--foreground))',
    colorInputBackground: 'hsl(var(--background))',
    colorInputFocus: 'hsl(var(--ring))',
    colorBorder: 'hsl(var(--border))',

    // Card/Popover - matches your card tokens
    colorCard: 'hsl(var(--card))',
    colorCardForeground: 'hsl(var(--card-foreground))',
    colorPopover: 'hsl(var(--popover))',
    colorPopoverForeground: 'hsl(var(--popover-foreground))',

    // Text colors
    colorText: 'hsl(var(--foreground))',
    colorTextSecondary: 'hsl(var(--muted-foreground))',

    // Button styling
    colorButtonPrimary: 'hsl(var(--primary))',
    colorButtonPrimaryText: 'hsl(var(--primary-foreground))',
    colorButtonSecondary: 'hsl(var(--secondary))',
    colorButtonSecondaryText: 'hsl(var(--secondary-foreground))',

    // Shadows - subtle industrial luxury
    shadowShimmer: '0 4px 20px hsl(var(--primary) / 0.15)',
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'iconButton',
    showOptionalFields: false,
  },
  elements: {
    // Global element styling
    rootBox: {
      fontFamily: 'Inter, sans-serif',
    },
    card: {
      borderRadius: '0.75rem',
      boxShadow: '0 20px 60px -10px hsl(0 0% 0% / 0.15)',
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
    },
    headerSubtitle: {
      fontSize: '0.875rem',
      color: 'hsl(var(--muted-foreground))',
    },
    formButtonPrimary: {
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 20px hsl(var(--primary) / 0.25)',
      },
    },
    formFieldInput: {
      borderRadius: '0.5rem',
      borderColor: 'hsl(var(--border))',
      '&:focus': {
        borderColor: 'hsl(var(--ring))',
        boxShadow: '0 0 0 2px hsl(var(--ring) / 0.2)',
      },
    },
  },
}

/**
 * Dark mode appearance - optimized for Industrial Dark theme
 * Automatically switches when dark mode is active
 */
export const clerkDarkAppearance: Appearance = {
  variables: {
    // Primary - same sky-500 for consistency
    colorPrimary: 'hsl(var(--primary))',
    colorPrimaryForeground: 'hsl(var(--primary-foreground))',

    // Background & Foreground - dark theme tokens
    colorBackground: 'hsl(var(--background))',
    colorForeground: 'hsl(var(--foreground))',

    // Neutral colors - dark theme muted
    colorNeutral: 'hsl(var(--muted))',
    colorMuted: 'hsl(var(--muted))',
    colorMutedForeground: 'hsl(var(--muted-foreground))',

    // States
    colorDanger: 'hsl(var(--destructive))',
    colorDangerForeground: 'hsl(var(--destructive-foreground))',
    colorSuccess: '#22c55e',
    colorWarning: '#f97316',

    // Typography
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },

    // Border radius
    borderRadius: '0.75rem',

    // Input styling - dark theme
    colorInput: 'hsl(var(--input))',
    colorInputText: 'hsl(var(--foreground))',
    colorInputBackground: 'hsl(var(--background))',
    colorInputFocus: 'hsl(var(--ring))',
    colorBorder: 'hsl(var(--border))',

    // Card/Popover - dark theme
    colorCard: 'hsl(var(--card))',
    colorCardForeground: 'hsl(var(--card-foreground))',
    colorPopover: 'hsl(var(--popover))',
    colorPopoverForeground: 'hsl(var(--popover-foreground))',

    // Text colors
    colorText: 'hsl(var(--foreground))',
    colorTextSecondary: 'hsl(var(--muted-foreground))',

    // Button styling
    colorButtonPrimary: 'hsl(var(--primary))',
    colorButtonPrimaryText: 'hsl(var(--primary-foreground))',
    colorButtonSecondary: 'hsl(var(--secondary))',
    colorButtonSecondaryText: 'hsl(var(--secondary-foreground))',

    // Shadows - subtle for dark mode
    shadowShimmer: '0 4px 20px hsl(var(--primary) / 0.2)',
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'iconButton',
    showOptionalFields: false,
  },
  elements: {
    rootBox: {
      fontFamily: 'Inter, sans-serif',
    },
    card: {
      borderRadius: '0.75rem',
      boxShadow: '0 20px 60px -10px hsl(0 0% 0% / 0.3)',
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
    },
    headerSubtitle: {
      fontSize: '0.875rem',
      color: 'hsl(var(--muted-foreground))',
    },
    formButtonPrimary: {
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 20px hsl(var(--primary) / 0.3)',
      },
    },
    formFieldInput: {
      borderRadius: '0.5rem',
      borderColor: 'hsl(var(--border))',
      '&:focus': {
        borderColor: 'hsl(var(--ring))',
        boxShadow: '0 0 0 2px hsl(var(--ring) / 0.3)',
      },
    },
  },
}

/**
 * Get Clerk appearance based on current theme
 * Use this hook in components that need dynamic Clerk theming
 *
 * @param theme - Current theme ('light' | 'dark')
 * @returns Clerk Appearance configuration
 */
export function getClerkAppearance(
  theme: 'light' | 'dark'
): Appearance {
  return theme === 'dark' ? clerkDarkAppearance : clerkAppearance
}
