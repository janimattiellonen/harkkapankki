/**
 * Extracts YouTube video ID from various URL formats or validates a direct ID
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Direct video ID
 */
export function extractYouTubeId(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // Check if it's a URL
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    try {
      const url = new URL(trimmed);

      // Validate domain is YouTube
      if (!url.hostname.includes('youtube.com') && !url.hostname.includes('youtu.be')) {
        return null;
      }

      // Extract from youtube.com/watch?v=VIDEO_ID
      if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
        return url.searchParams.get('v');
      }

      // Extract from youtu.be/VIDEO_ID
      if (url.hostname.includes('youtu.be')) {
        return url.pathname.slice(1).split('?')[0];
      }

      // Extract from youtube.com/embed/VIDEO_ID
      if (url.pathname.includes('/embed/')) {
        return url.pathname.split('/embed/')[1].split('?')[0];
      }
    } catch (e) {
      // Not a valid URL, might be just an ID
    }
  }

  // Assume it's a direct video ID - validate format
  // YouTube IDs are typically 11 characters, alphanumeric with _ and -
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (videoIdRegex.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Validates if a string is a valid YouTube URL or video ID
 */
export function isValidYouTubeInput(input: string): boolean {
  return extractYouTubeId(input) !== null;
}

/**
 * Creates a YouTube embed URL from a video ID
 */
export function createYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
