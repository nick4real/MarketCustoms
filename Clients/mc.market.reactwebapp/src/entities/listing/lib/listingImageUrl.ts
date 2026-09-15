export function listingImageUrl(
  photoId: string,
  width: number,
  height: number,
) {
  return `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&auto=format`;
}
