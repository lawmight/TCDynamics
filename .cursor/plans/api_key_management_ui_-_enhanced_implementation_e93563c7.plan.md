---
name: API Key Management UI - Enhanced Implementation
overview: Implement a comprehensive API key management UI following industry best practices from Stripe, OpenAI, and GitHub, with enhanced security patterns, better UX, and modern React Query integration.
todos:
  - id: '1'
    content: Create API client functions in apps/frontend/src/api/apiKeys.ts following polar.ts auth pattern
    status: pending
  - id: '2'
    content: Create React Query hook in apps/frontend/src/hooks/useApiKeys.ts with mutations for create/revoke
    status: pending
    dependencies:
      - '1'
  - id: '3'
    content: Add shadcn Dialog and AlertDialog components if missing (npx shadcn add dialog alert-dialog)
    status: pending
  - id: '4'
    content: Create ApiKeyCreateDialog component for one-time key display with copy functionality and security warnings
    status: pending
    dependencies:
      - '3'
  - id: '5'
    content: Create main ApiKeyManager component with list view, create button, and revoke functionality
    status: pending
    dependencies:
      - '2'
      - '4'
  - id: '6'
    content: Add enhanced revocation confirmation dialog with context display (key prefix, dates), consequence warnings, loading states, and error handling using AlertDialog component
    status: pending
    dependencies:
      - '3'
      - '5'
  - id: '7'
    content: Integrate ApiKeyManager into Settings.tsx page with proper layout and authentication check
    status: pending
    dependencies:
      - '5'
      - '6'
  - id: '8'
    content: Add comprehensive tests for ApiKeyManager component with mocked hooks and API calls
    status: pending
    dependencies:
      - '5'
isProject: false
---

# API Key Management UI - Enhanced Implementation Plan

## Research Summary

After researching current industry trends and best practices from leading platforms (Stripe, OpenAI, GitHub), our plan aligns well with modern standards. Key findings:

### Industry Best Practices Identified:

1. **One-time key display** - Full key shown only once on creation (✅ in plan)
2. **Key masking** - Prefix display in lists (✅ in plan)
3. **Secure copy functionality** - Clipboard with visual feedback (✅ in plan)
4. **Revocation confirmation** - Prevent accidental deletions (⚠️ needs enhancement)
5. **Last used tracking** - Show usage patterns (✅ in plan)
6. **Security warnings** - Clear messaging about secure storage (✅ in plan)
7. **Modern UI patterns** - Card-based layouts, clear hierarchy (✅ in plan)

### Enhancements Recommended:

- ✅ Enhanced confirmation dialog for revocation with context display and consequence warnings (implemented)
- Enhanced copy feedback with toast notifications
- Consider key naming/description (optional future enhancement)
- Better error states and loading indicators
- Optional undo capability after revocation (future enhancement)

## Architecture

```
apps/frontend/src/
├── api/
│   └── apiKeys.ts              # API client (GET, POST, DELETE)
├── hooks/
│   └── useApiKeys.ts           # React Query hook for key management
├── components/
│   ├── app/
│   │   ├── ApiKeyManager.tsx   # Main management component
│   │   └── ApiKeyCreateDialog.tsx # One-time key display dialog
│   └── ui/
│       └── dialog.tsx          # Add shadcn Dialog component (if missing)
└── pages/
    └── Settings.tsx             # Enhanced with API key section
```

## Implementation Details

### 1. API Client (`apps/frontend/src/api/apiKeys.ts`)

Follow pattern from `apps/frontend/src/utils/polar.ts` for auth:

```typescript
export type ApiKey = {
  id: string
  key_prefix: string
  created_at: string
  revoked_at: string | null
  last_used_at: string | null
}

export type CreateApiKeyResponse = {
  success: boolean
  id: string
  key: string // Only on creation
  key_prefix: string
  created_at: string
}

// Use getToken pattern from polar.ts
export async function listApiKeys(
  getToken: () => Promise<string | null>
): Promise<ApiKey[]>

export async function createApiKey(
  getToken: () => Promise<string | null>
): Promise<CreateApiKeyResponse>

export async function revokeApiKey(
  keyId: string,
  getToken: () => Promise<string | null>
): Promise<{ success: boolean; message: string }>
```

**Key Requirements:**

- Include `Authorization: Bearer ${token}` header
- Handle 401 → redirect to login
- Return typed responses matching backend schema
- Error handling with user-friendly messages

### 2. React Query Hook (`apps/frontend/src/hooks/useApiKeys.ts`)

Follow pattern from `apps/frontend/src/pages/Dashboard.tsx`:

```typescript
export function useApiKeys() {
  const { getToken } = useAuth()

  // Query for listing keys
  const {
    data: keys,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => listApiKeys(getToken),
    enabled: !!getToken,
  })

  // Mutation for creating key
  const createMutation = useMutation({
    mutationFn: () => createApiKey(getToken),
    onSuccess: () => {
      refetch() // Refresh list
      toast.success('API key created')
    },
  })

  // Mutation for revoking key
  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => revokeApiKey(keyId, getToken),
    onSuccess: () => {
      refetch() // Refresh list
      toast.success('API key revoked')
    },
  })

  return {
    keys: keys || [],
    isLoading,
    error,
    createKey: createMutation.mutate,
    revokeKey: revokeMutation.mutate,
    isCreating: createMutation.isPending,
    isRevoking: revokeMutation.isPending,
  }
}
```

### 3. API Key Manager Component (`apps/frontend/src/components/app/ApiKeyManager.tsx`)

Follow UI patterns from `apps/frontend/src/pages/app/Files.tsx`:

**Features:**

- **List View**: Card grid showing:
  - Key prefix (e.g., `tc_live_abc123...`)
  - Creation date (formatted)
  - Last used date (if available) with "Never used" fallback
  - Revoke button with confirmation
- **Create Section**: Button + dialog for one-time key display
- **Empty State**: Friendly message when no keys exist
- **Loading States**: Skeleton loaders during operations

**UI Components:**

- `Card`, `CardHeader`, `CardContent` from `@/components/ui/card`
- `Button` from `@/components/ui/button`
- `Badge` for status indicators
- `Dialog` from `@/components/ui/dialog` (add if missing)
- `toast` from `sonner` for notifications
- Icons: `Key`, `Copy`, `Trash2`, `AlertTriangle`, `CheckCircle2`, `Loader2`

### 4. Create Key Dialog (`apps/frontend/src/components/app/ApiKeyCreateDialog.tsx`)

**Security Features:**

- Show full key only once
- Large, copyable text field
- Copy button with visual feedback (icon changes to checkmark)
- Warning message about secure storage
- Auto-close after 30 seconds or manual close
- Prevent closing accidentally (confirm on outside click)

**UI Pattern:**

```typescript
<Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Your API Key</DialogTitle>
      <DialogDescription>
        Copy this key now. You won't be able to see it again.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="relative">
        <Input value={key} readOnly className="font-mono" />
        <Button onClick={handleCopy}>
          {copied ? <CheckCircle2 /> : <Copy />}
        </Button>
      </div>
      <Alert variant="warning">
        <AlertTriangle />
        Store this key securely. It won't be shown again.
      </Alert>
    </div>
  </DialogContent>
</Dialog>
```

### 5. Revocation Confirmation (Enhanced)

**Industry Best Practices for Revocation Confirmation:**

Based on research from Stripe, OpenAI, and GitHub patterns, the revocation confirmation should include:

1. **Context Display**: Show which key is being revoked (key prefix)
2. **Consequence Warnings**: Clear explanation of immediate impact
3. **Key Metadata**: Display creation date and last used date for context
4. **Visual Hierarchy**: Use destructive styling with warning icons
5. **Loading States**: Show progress during revocation operation
6. **Error Handling**: Graceful error display with retry option
7. **Accessibility**: Proper ARIA labels and keyboard navigation
8. **Undo Capability**: Consider showing undo toast after revocation (optional enhancement)

**Enhanced Implementation Pattern:**

**Note**: `AlertDialogDescription` renders as a `<p>` element (Radix UI), so block-level elements must be placed outside it to maintain valid HTML structure.

```typescript
// In ApiKeyManager.tsx - Revocation confirmation component
<AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
      </div>
      <AlertDialogDescription>
        You are about to revoke the following API key. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>

    {/* Context and warnings outside Description (block elements) */}
    <div className="space-y-3 pt-2">
      {/* Key Context Card */}
      <div className="rounded-md border bg-muted/50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Key Prefix:</span>
          <code className="text-xs font-mono bg-background px-2 py-1 rounded">
            {keyToRevoke?.key_prefix}
          </code>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created:</span>
          <span>{formatDate(keyToRevoke?.created_at)}</span>
        </div>
        {keyToRevoke?.last_used_at && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last Used:</span>
            <span>{formatDate(keyToRevoke.last_used_at)}</span>
          </div>
        )}
      </div>

      {/* Warning Alert */}
      <Alert variant="destructive" className="mt-3">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Immediate Impact</AlertTitle>
        <AlertDescription>
          This key will stop working immediately. Any applications or services using this key will lose access and may experience downtime.
        </AlertDescription>
      </Alert>
    </div>

    <AlertDialogFooter>
      <AlertDialogCancel disabled={isRevoking}>
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={() => revokeMutation.mutate(keyToRevoke.id)}
        disabled={isRevoking}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {isRevoking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Revoking...
          </>
        ) : (
          'Revoke Key'
        )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Key Enhancements:**

1. **Context Display**: Shows key prefix, creation date, and last used date in a card format
2. **Visual Warning**: Uses `AlertTriangle` icon and destructive variant Alert component
3. **Consequence Explanation**: Clear warning about immediate impact and potential downtime
4. **Loading State**: Disables buttons and shows spinner during revocation
5. **Error Handling**: Uses React Query's `onError` callback for consistent error handling with toast notifications and retry action
6. **Accessibility**: Proper ARIA labels, keyboard navigation, focus management
7. **Valid HTML Structure**: Block elements (div, Alert) placed outside `AlertDialogDescription` since it renders as `<p>` element

**Error Handling Pattern (React Query Integration):**

Use React Query's built-in error handling in the mutation for consistency:

```typescript
// In useApiKeys.ts hook
const revokeMutation = useMutation({
  mutationFn: (keyId: string) => revokeApiKey(keyId, getToken),
  onSuccess: (data, keyId) => {
    refetch() // Refresh list
    toast.success('API key revoked successfully', {
      description: `Key has been revoked`,
    })
    // Close dialog in component
    setRevokeDialogOpen(false)
    setKeyToRevoke(null)
  },
  onError: (error: Error) => {
    toast.error('Failed to revoke API key', {
      description: error.message || 'An unexpected error occurred',
      action: {
        label: 'Retry',
        onClick: () => {
          if (keyToRevoke) {
            revokeMutation.mutate(keyToRevoke.id)
          }
        },
      },
    })
  },
})

// In ApiKeyManager.tsx component
const { revokeKey, isRevoking } = useApiKeys()
// Use revokeMutation directly in AlertDialogAction onClick
```

**Alternative: Manual Error Handling (if needed)**

If you need more control, you can still use try-catch:

```typescript
const handleConfirmRevoke = async () => {
  if (!keyToRevoke) return

  try {
    await revokeKey(keyToRevoke.id)
    toast.success('API key revoked successfully', {
      description: `Key ${keyToRevoke.key_prefix} has been revoked`,
    })
    setRevokeDialogOpen(false)
    setKeyToRevoke(null)
  } catch (error) {
    toast.error('Failed to revoke API key', {
      description:
        error instanceof Error ? error.message : 'An unexpected error occurred',
      action: {
        label: 'Retry',
        onClick: () => handleConfirmRevoke(),
      },
    })
  }
}
```

**Optional: Undo Capability**

For enhanced UX, consider showing an undo toast after successful revocation. **Note**: This requires backend support for undo functionality (e.g., soft delete with time window):

```typescript
// In useApiKeys.ts - Enhanced success handler
onSuccess: (data, keyId) => {
  refetch()

  // Show undo toast (requires backend undo endpoint)
  toast.success('API key revoked', {
    description: 'This action can be undone within 5 seconds',
    action: {
      label: 'Undo',
      onClick: async () => {
        try {
          await undoRevokeApiKey(keyId, getToken)
          refetch()
          toast.success('API key restored')
        } catch (error) {
          toast.error('Failed to undo revocation')
        }
      },
    },
    duration: 5000,
  })

  setRevokeDialogOpen(false)
  setKeyToRevoke(null)
}
```

**Implementation Requirements for Undo:**

- Backend endpoint to restore revoked keys (e.g., `POST /api/app/api-keys/:id/restore`)
- Time window for undo (e.g., 5-10 seconds)
- Soft delete pattern in database (mark as revoked, not hard delete)
- This is a **future enhancement** and not required for initial implementation

**Accessibility Requirements:**

- `role="alertdialog"` on AlertDialogContent
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to description
- Focus trap within dialog
- Escape key closes dialog (unless loading)
- Tab navigation between buttons

### 6. Settings Page Integration (`apps/frontend/src/pages/Settings.tsx`)

Enhance following existing pattern:

- Keep RUM configuration section
- Add "API Keys" section with `Separator`
- Use `useRequireAuth()` for authentication check
- Responsive layout with max-width container
- Section titles with icons

### 7. Add Missing UI Components

If `Dialog` component doesn't exist, add shadcn Dialog:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
```

### 8. Error Handling & User Feedback

**Error States:**

- Network errors → Toast with retry option
- 401 errors → Redirect to login (via `useRequireAuth`)
- 500 errors → User-friendly error message
- Validation errors → Inline error display

**Success Feedback:**

- Toast on key creation
- Toast on key revocation
- Loading states during operations
- Copy confirmation (icon change + toast)

### 9. Testing (`apps/frontend/src/components/app/__tests__/ApiKeyManager.test.tsx`)

**Unit Tests:**

- Component renders correctly
- Empty state displays
- Create key opens dialog
- Revoke shows confirmation
- Copy button works
- Error states display correctly

**Integration Tests:**

- API calls with correct auth headers
- React Query mutations work
- Error handling flows
- Toast notifications appear

**Mock Setup:**

- Mock `useApiKeys` hook
- Mock `useAuth` hook
- Mock API fetch calls
- Mock `toast` from sonner

## Security Enhancements

1. **Token Handling:**
   - Never log tokens or keys
   - Use Clerk's secure token storage
   - Validate token before API calls

2. **Key Display:**
   - Show full key only once
   - Mask keys in list (prefix only)
   - Auto-hide dialog after timeout
   - Prevent accidental closing

3. **User Warnings:**
   - Clear warning about secure storage
   - Warn about version control
   - Provide copy-to-clipboard
   - Show "Never used" for unused keys

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly messages
- Focus management in dialogs
- Proper semantic HTML

## Comparison with Industry Standards

| Feature | Our Plan | Industry Standard | Status |

| ----------------------- | -------- | ----------------- | --------------------- |

| One-time key display | ✅ | ✅ | Aligned |

| Key masking | ✅ | ✅ | Aligned |

| Copy to clipboard | ✅ | ✅ | Aligned |

| Revocation confirmation | ✅ | ✅ | **Enhanced with context, warnings, and error handling** |

| Last used tracking | ✅ | ✅ | Aligned |

| Security warnings | ✅ | ✅ | Aligned |

| Modern UI | ✅ | ✅ | Aligned |

| Error handling | ✅ | ✅ | Aligned |

## File Changes Summary

### New Files:

1. `apps/frontend/src/api/apiKeys.ts` - API client functions
2. `apps/frontend/src/hooks/useApiKeys.ts` - React Query hook
3. `apps/frontend/src/components/app/ApiKeyManager.tsx` - Main component
4. `apps/frontend/src/components/app/ApiKeyCreateDialog.tsx` - Key display dialog
5. `apps/frontend/src/components/app/__tests__/ApiKeyManager.test.tsx` - Tests

### Modified Files:

1. `apps/frontend/src/pages/Settings.tsx` - Add API key section

### Potentially New Files:

1. `apps/frontend/src/components/ui/dialog.tsx` - If missing (shadcn component)
2. `apps/frontend/src/components/ui/alert-dialog.tsx` - If missing (shadcn component)
3. `apps/frontend/src/components/ui/alert.tsx` - If missing (shadcn component)

## Success Criteria

- ✅ Users can view all their API keys
- ✅ Users can create new API keys
- ✅ Users can revoke API keys (with confirmation)
- ✅ New keys displayed securely (one-time)
- ✅ All operations provide user feedback
- ✅ Error states handled gracefully
- ✅ Component fully tested
- ✅ Follows project code style and patterns
- ✅ Aligns with industry best practices
