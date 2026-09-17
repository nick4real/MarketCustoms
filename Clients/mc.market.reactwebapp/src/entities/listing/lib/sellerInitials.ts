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
