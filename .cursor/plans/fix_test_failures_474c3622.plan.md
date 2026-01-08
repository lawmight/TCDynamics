---
name: Fix Test Failures
overview: Fix 4 test failures in Hero component tests and resolve obsolete files-upload test import error. Update tests to match current video-based implementation and add proper video element mocking.
todos: []
isProject: false
---

# Fix Test Failures

## Issues Identified

1. **Hero image test** - Tests for non-existent image element
2. **Video muted attribute** - Test assertion issue with boolean attribute
3. **Pause/play button tests** - JSdom doesn't implement HTMLMediaElement methods
4. **files-upload.test.js** - Obsolete import causing parse error

## Implementation Plan

### 1. Fix Hero Component Tests (`apps/frontend/src/components/__tests__/Hero.test.tsx`)

#### 1.1 Remove obsolete hero image test

- **File**: `apps/frontend/src/components/__tests__/Hero.test.tsx` (lines 43-49)
- **Action**: Remove the test case "should render hero image with alt text" since the component now uses a video element with a poster image, not an `<img>` tag
- **Alternative**: If poster image testing is needed, test for the video's `poster` attribute instead

#### 1.2 Fix video muted attribute test

- **File**: `apps/frontend/src/components/__tests__/Hero.test.tsx` (line 79)
- **Issue**: Boolean attributes in JSX may not appear as attributes in jsdom
- **Action**: Change from `expect(video).toHaveAttribute('muted')` to `expect(video).toHaveProperty('muted', true)` or check `video.muted === true`

#### 1.3 Add HTMLMediaElement mocking for video tests

- **File**: `apps/frontend/src/test/setup.ts`
- **Action**: Add mock implementations for `HTMLMediaElement.prototype.play()` and `HTMLMediaElement.prototype.pause()` methods to prevent "Not implemented" errors
- **Implementation**:
  ```typescript
  // Mock HTMLMediaElement methods for video testing
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
  ```


#### 1.4 Fix pause/play button interaction tests

- **File**: `apps/frontend/src/components/__tests__/Hero.test.tsx` (lines 96-155)
- **Actions**:
  - Wrap state updates in `act()` from `@testing-library/react`
  - Use `waitFor` to handle async state changes after button clicks
  - Mock video play/pause methods before rendering
  - Update test expectations to account for mocked video behavior

### 2. Fix files-upload Test Import Error (`api/__tests__/files-upload.test.js`)

#### 2.1 Remove obsolete import

- **File**: `api/__tests__/files-upload.test.js` (line 9)
- **Issue**: File imports from `./_lib/supabase.js` which doesn't exist (migrated to MongoDB)
- **Action**: Remove the import statement since all tests are already skipped with `test.skip`
- **Note**: The file has a TODO comment indicating it should be rewritten for MongoDB, but since all tests are skipped, we can either:
  - **Option A**: Remove the import and keep the file for future reference
  - **Option B**: Delete the entire test file (cleaner, but loses the test structure)
- **Recommendation**: Option A - remove import, keep file structure for future MongoDB test implementation

## Files to Modify

1. `apps/frontend/src/components/__tests__/Hero.test.tsx`

   - Remove hero image test (lines 43-49)
   - Fix muted attribute assertion (line 79)
   - Update pause/play button tests with proper mocking and act() wrapping (lines 96-155)

2. `apps/frontend/src/test/setup.ts`

   - Add HTMLMediaElement method mocks after line 82 (after ResizeObserver mock)

3. `api/__tests__/files-upload.test.js`

   - Remove or comment out the import statement (line 9)

## Testing Strategy

- Run `npm run test:frontend` to verify Hero component tests pass
- Ensure no new test failures are introduced
- Verify video interaction tests work with mocked methods

## Notes

- The Hero component implementation is correct - these are test-only issues
- JSdom limitations require mocking HTMLMediaElement methods
- The files-upload test file is intentionally obsolete (all tests skipped) but still parsed by Vitest
