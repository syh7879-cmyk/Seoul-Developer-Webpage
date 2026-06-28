export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

export const formatCurrencyKRW = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const absoluteValue = Math.abs(safeValue);

  if (absoluteValue >= 100000000) {
    return `약 ${formatNumber(Math.round(safeValue / 100000000))}억 원`;
  }

  if (absoluteValue >= 10000) {
    return `약 ${formatNumber(Math.round(safeValue / 10000))}만 원`;
  }

  return `${formatNumber(safeValue)}원`;
};

export const formatAreaSqm = (value: number): string => `${formatNumber(value)}㎡`;

export const formatAreaPyeong = (value: number): string => `${formatNumber(value / 3.305785)}평`;

export const formatPercent = (value: number): string => `${formatNumber(value)}%`;
