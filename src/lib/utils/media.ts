/**
 * Utility functions for handling media formats
 */

/**
 * Checks if a media URL is a video format (WebM, MP4, etc.)
 * @param url - The media URL to check
 * @returns True if it's a video format
 */
export function isVideoFormat(url: string): boolean {
	const videoExtensions = ['.webm', '.mp4', '.mov', '.avi', '.mkv'];
	return videoExtensions.some(ext => url.toLowerCase().includes(ext));
}

/**
 * Checks if a media URL is an animated format (GIF, WebM, MP4)
 * @param url - The media URL to check
 * @returns True if it's an animated format
 */
export function isAnimatedFormat(url: string): boolean {
	const animatedExtensions = ['.gif', '.webm', '.mp4', '.mov', '.avi', '.mkv'];
	return animatedExtensions.some(ext => url.toLowerCase().includes(ext));
}
