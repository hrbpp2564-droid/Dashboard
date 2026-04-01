export const MONTH_NAMES_TH = [
  'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.',
  'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.'
];

export const MONTH_INDICES = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const COLORS = {
  blue: '#3b82f6',
  blueBg: 'rgba(59, 130, 246, 0.15)',
  red: '#ef4444',
  redBg: 'rgba(239, 68, 68, 0.15)',
  green: '#22c55e',
  greenBg: 'rgba(34, 197, 94, 0.15)',
  yellow: '#eab308',
  yellowBg: 'rgba(234, 179, 8, 0.15)',
  purple: '#a855f7',
  white: '#ffffff',
  gray: '#94a3b8',
  darkBg: '#0f172a',
  cardBg: 'rgba(30, 41, 59, 0.8)',
};

export function formatCurrency(value) {
  if (value == null) return '฿0';
  return '฿' + Number(value).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatNumber(value) {
  if (value == null) return '0';
  return Number(value).toLocaleString('th-TH');
}

export function formatPercent(value) {
  if (value == null) return '0%';
  return value.toFixed(1) + '%';
}
