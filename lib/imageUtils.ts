/**
 * Image URL utilities
 * Handles both old filesystem paths and new Vercel Blob Storage URLs
 */

/**
 * Normalizes an image URL to ensure it works in both local and production environments
 * 
 * @param url - The image URL (can be `/uploads/...` or `https://...blob.vercel-storage.com/...`)
 * @returns A normalized URL that works in the current environment
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) {
    return '/placeholder-image.png'; // You can add a placeholder image later
  }

  // If it's already a full URL (Vercel Blob Storage), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path starting with /uploads/, it should work in local dev
  // On Vercel, these won't work unless the files are in the public folder
  // For now, return as-is - they'll show broken images on Vercel until re-uploaded
  if (url.startsWith('/uploads/')) {
    // In production (Vercel), these paths won't work
    // Return the URL as-is - the browser will try to load it
    // If it fails, the image will just not display (handled by img tag's onError)
    return url;
  }

  // If it's a relative path without leading slash, add it
  if (!url.startsWith('/')) {
    return `/${url}`;
  }

  return url;
}

/**
 * Checks if an image URL is from Vercel Blob Storage
 */
export function isBlobStorageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('blob.vercel-storage.com');
}

/**
 * Checks if an image URL is a local filesystem path
 */
export function isLocalPath(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith('/uploads/');
}

/**
 * Gets a placeholder image URL for missing/broken images
 */
export function getPlaceholderImageUrl(): string {
  return '/placeholder-image.png'; // You can add a placeholder image to public/ later
}

