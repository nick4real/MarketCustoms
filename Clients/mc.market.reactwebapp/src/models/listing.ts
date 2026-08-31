export type ListingParameter = {
  name: string;
  value: string;
};

export type Listing = {
  id: number;
  title: string;
  price: number;
  category: string;
  condition: string;
  seller: string;
  images: string[];
  location: string;
  description: string;
  tags: string[];
  parameters: ListingParameter[];
  listedAt: string;
  stock: number;
  sellerRating: number;
  sellerSales: number;
};

export function listingImageUrl(
  photoId: string,
  width: number,
  height: number,
) {
  return `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&auto=format`;
}

export function listingSku(id: number) {
  return `MKT-${String(id).padStart(4, "0")}`;
}

export function sellerInitials(name: string) {
  return name
    .replaceAll(".", "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
