export function listingSku(id: string | number) {
  return `MKT-${String(id).padStart(4, "0")}`;
}
