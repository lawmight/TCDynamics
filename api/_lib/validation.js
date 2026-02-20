/**
 * Enhanced validation middleware for forms
 * Now re-exports from @tcd/shared-utils/validation — single source of truth
 *
 * MIGRATION NOTE: All validation logic has been moved to @tcd/shared-utils.
 * This file now re-exports everything so existing imports continue working.
 */

export {
    validateEmail, validateFormData, validateMessage, validateName, validatePhone, validationSchemas
} from '@tcd/shared-utils/validation';

