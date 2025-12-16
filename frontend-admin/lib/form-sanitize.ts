import { sanitize } from "./sanitize";
import { convertCategoryNameToURLFriendly as convertToSlug } from "../utils/categoryFormating";

/**
 * Sanitize form data before sending to API
 * @param formData - Form data object
 * @returns Sanitized form data
 */
export function sanitizeFormData(formData: any): any {
  if (!formData) return formData;

  const sanitized = { ...formData };

  // Sanitize text fields
  if (sanitized.title) sanitized.title = sanitize(sanitized.title);
  if (sanitized.manufacturer)
    sanitized.manufacturer = sanitize(sanitized.manufacturer);
  if (sanitized.description)
    sanitized.description = sanitize(sanitized.description);
  // Normalize slug: prefer a URL-friendly version of the provided slug.
  if (sanitized.slug && String(sanitized.slug).trim().length > 0) {
    // Convert to URL-friendly form (preserves hyphens, lowercases words)
    sanitized.slug = convertToSlug(String(sanitized.slug).trim());
  } else if (sanitized.title && String(sanitized.title).trim().length > 0) {
    // If no slug provided, generate one from the title
    sanitized.slug = convertToSlug(String(sanitized.title).trim());
  }
  if (sanitized.name) sanitized.name = sanitize(sanitized.name);
  if (sanitized.lastname) sanitized.lastname = sanitize(sanitized.lastname);
  if (sanitized.email) sanitized.email = sanitize(sanitized.email);

  return sanitized;
}
