/**
 * Validation utilities for the Creator Upload Page
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates photo file type and size
 */
export function validatePhoto(file: File): ValidationResult {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPG or PNG image' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Photo must be smaller than 10MB' };
  }

  return { valid: true };
}

/**
 * Validates creator name
 */
export function validateCreatorName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Please enter your name' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Name must be 50 characters or less' };
  }

  return { valid: true };
}

/**
 * Validates creator prompt/question
 */
export function validatePrompt(prompt: string): ValidationResult {
  const trimmed = prompt.trim();

  if (trimmed.length < 10) {
    return { valid: false, error: 'Please write a longer question (at least 10 characters)' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Question must be 200 characters or less' };
  }

  return { valid: true };
}
