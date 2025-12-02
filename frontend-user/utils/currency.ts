export function formatCurrencyVND(input: number | string | null | undefined): string {
  const n = typeof input === 'string' ? Number(input) : input ?? 0;
  const value = Number.isFinite(Number(n)) ? Math.round(Number(n)) : 0;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value) + 'đ';
}
