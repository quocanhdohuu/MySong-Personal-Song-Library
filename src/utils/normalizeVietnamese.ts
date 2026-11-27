/**
 * Normalize Vietnamese text for accent-insensitive, case-insensitive search.
 * Handles Unicode NFD combining marks as well as đ/Đ.
 */
export function normalizeVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
