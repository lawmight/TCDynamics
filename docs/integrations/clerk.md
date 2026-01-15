# Clerk Customization Guide for TCDynamics

**Last Updated**: 2026-01-09
**Status**: Active

## Overview

This document outlines how Clerk authentication components are customized to match the TCDynamics Industrial Luxury theme. The customization uses Clerk's Appearance API with dynamic theme switching support.

## Architecture

### Theme Integration

Clerk components automatically switch between light and dark themes based on the app's theme state:

1. **ThemeProvider** (`apps/frontend/src/components/ThemeProvider.tsx`)
   - Manages light/dark/system theme modes
   - Provides `resolvedTheme` ('light' | 'dark') to child components

2. **Clerk Theme Configuration** (`apps/frontend/src/config/clerkTheme.ts`)
   - `clerkAppearance`: Light theme configuration
   - `clerkDarkAppearance`: Dark theme configuration
   - `getClerkAppearance(theme)`: Helper function to get theme-based appearance

3. **ThemedClerkProvider** (`apps/frontend/src/App.tsx`)
   - Wrapper component that reads theme from context
   - Dynamically passes correct appearance to ClerkProvider

### Design System Mapping

Clerk appearance variables are mapped to your Tailwind CSS design tokens:

```typescript
// Example mapping
colorPrimary: 'hsl(var(--primary))'           // Maps to --primary CSS variable
colorBackground: 'hsl(var(--background))'     // Maps to --background CSS variable
colorForeground: 'hsl(var(--foreground))'     // Maps to --foreground CSS variable
borderRadius: '0.75rem'                        // Matches your --radius token
fontFamily: 'Inter, sans-serif'                // Matches your typography
```

## Key Customization Features

### 1. CSS Variables Integration

All Clerk colors use CSS variables (`hsl(var(--token))`), which means:
- ✅ Automatic theme switching when CSS variables change
- ✅ Consistent with your design system
- ✅ Easy to maintain and update

### 2. Comprehensive Variable Mapping

The configuration includes mappings for:
- **Colors**: Primary, background, foreground, muted, danger, success, warning
- **Inputs**: Input background, text, focus states, borders
- **Cards/Popovers**: Card backgrounds and foregrounds
- **Typography**: Font family, sizes, weights
- **Layout**: Border radius, shadows, spacing

### 3. Element-Level Customization

Custom styling for specific Clerk components:
- `rootBox`: Global container styling
- `card`: Card component styling with shadows
- `headerTitle`/`headerSubtitle`: Header typography
- `formButtonPrimary`: Primary button styling with hover effects
- `formFieldInput`: Input field styling with focus states

### 4. Layout Configuration

```typescript
layout: {
  socialButtonsPlacement: 'bottom',      // Social login buttons at bottom
  socialButtonsVariant: 'iconButton',    // Icon-only social buttons
  showOptionalFields: false,             // Hide optional form fields
}
```

## Usage Examples

### Basic Usage (Automatic Theme Switching)

```tsx
// In App.tsx - automatically switches based on theme
<ThemedClerkProvider>
  <YourApp />
</ThemedClerkProvider>
```

### Manual Theme Selection

```tsx
import { getClerkAppearance } from '@/config/clerkTheme'
import { useTheme } from '@/components/ThemeProvider'

function MyComponent() {
  const { resolvedTheme } = useTheme()
  
  return (
    <SignIn appearance={getClerkAppearance(resolvedTheme)} />
  )
}
```

### Component-Level Customization

```tsx
import { getClerkAppearance } from '@/config/clerkTheme'
import { useTheme } from '@/components/ThemeProvider'

function CustomSignIn() {
  const { resolvedTheme } = useTheme()
  const baseAppearance = getClerkAppearance(resolvedTheme)
  
  return (
    <SignIn
      appearance={{
        ...baseAppearance,
        elements: {
          ...baseAppearance.elements,
          formButtonPrimary: {
            ...baseAppearance.elements?.formButtonPrimary,
            // Override specific styles
            backgroundColor: 'hsl(var(--primary))',
          },
        },
      }}
    />
  )
}
```

## Available Clerk Appearance Variables

### Color Variables

- `colorPrimary` - Primary brand color
- `colorPrimaryForeground` - Text on primary color
- `colorBackground` - Main background color
- `colorForeground` - Main text color
- `colorNeutral` - Neutral background color
- `colorMuted` - Muted background color
- `colorMutedForeground` - Muted text color
- `colorDanger` - Error/danger color
- `colorDangerForeground` - Text on danger color
- `colorSuccess` - Success color
- `colorWarning` - Warning color
- `colorInput` - Input background
- `colorInputText` - Input text color
- `colorInputBackground` - Input background (alternative)
- `colorInputFocus` - Input focus ring color
- `colorBorder` - Border color
- `colorCard` - Card background
- `colorCardForeground` - Card text color
- `colorPopover` - Popover background
- `colorPopoverForeground` - Popover text color
- `colorText` - General text color
- `colorTextSecondary` - Secondary text color
- `colorButtonPrimary` - Primary button background
- `colorButtonPrimaryText` - Primary button text
- `colorButtonSecondary` - Secondary button background
- `colorButtonSecondaryText` - Secondary button text

### Typography Variables

- `fontFamily` - Font family (e.g., 'Inter, sans-serif')
- `fontSize` - Base font size
- `fontWeight` - Font weight configuration object

### Layout Variables

- `borderRadius` - Border radius for components
- `shadowShimmer` - Shadow for shimmer effects

## Best Practices

### 1. Always Use CSS Variables

✅ **Good:**
```typescript
colorPrimary: 'hsl(var(--primary))'
```

❌ **Avoid:**
```typescript
colorPrimary: '#0ea5e9'  // Hard-coded, won't update with theme
```

### 2. Use getClerkAppearance() Helper

✅ **Good:**
```typescript
appearance={getClerkAppearance(resolvedTheme)}
```

❌ **Avoid:**
```typescript
appearance={resolvedTheme === 'dark' ? clerkDarkAppearance : clerkAppearance}
```

### 3. Extend, Don't Replace

When customizing specific components, extend the base appearance:

✅ **Good:**
```typescript
appearance={{
  ...baseAppearance,
  elements: {
    ...baseAppearance.elements,
    formButtonPrimary: {
      ...baseAppearance.elements?.formButtonPrimary,
      // Your overrides
    },
  },
}}
```

## Resources

- [Clerk Appearance API Documentation](https://clerk.com/docs/guides/customizing-clerk/appearance-prop/variables)
- [Clerk Themes Documentation](https://clerk.com/docs/nextjs/guides/customizing-clerk/appearance-prop/themes)
- [Clerk Theme Editor](https://clerk.com/components/theme-editor) - Visual theme customization tool

## Customization Based on NIA Research

Based on research from Clerk's official documentation (indexed via NIA MCP):

1. **CSS Variables Support**: Clerk supports CSS variables with `--clerk-` prefix, but we use direct HSL variable references for better integration with Tailwind
2. **Dynamic Theming**: Clerk's appearance prop can be updated dynamically, which we leverage for theme switching
3. **Element-Level Styling**: The `elements` property allows fine-grained control over specific component styles
4. **Theme Inheritance**: Base themes can be extended and overridden at component level

## Maintenance

When updating your design system:

1. Update CSS variables in `apps/frontend/src/index.css`
2. Clerk components will automatically pick up changes (since they use CSS variables)
3. If adding new design tokens, consider mapping them to Clerk variables in `clerkTheme.ts`
4. Test both light and dark themes after changes

---

**Last Updated**: 2026-01-09
**Based on**: Clerk Appearance API v5.x