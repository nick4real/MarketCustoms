export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
}

export function productImageSrc(imageLink?: string): string {
  if (imageLink?.trim()) {
    return imageLink;
  }
  return "/placeholder-product.svg";
}
