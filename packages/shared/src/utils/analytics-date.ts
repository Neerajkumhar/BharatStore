export interface DateRangeResult {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
  periodLabel: string;
}

export function getAnalyticsDateRange(
  range: string = '30d',
  startDateParam?: string,
  endDateParam?: string
): DateRangeResult {
  const now = new Date();
  
  // Calculate IST offset (+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  
  let currentStart: Date;
  let currentEnd: Date = now;
  let previousStart: Date;
  let previousEnd: Date;
  let periodLabel = 'vs previous 30 days';

  if (range === 'today') {
    const startOfDayIst = new Date(istNow);
    startOfDayIst.setUTCHours(0, 0, 0, 0);
    currentStart = new Date(startOfDayIst.getTime() - istOffsetMs);

    const prevStartOfDayIst = new Date(startOfDayIst);
    prevStartOfDayIst.setUTCDate(prevStartOfDayIst.getUTCDate() - 1);
    previousStart = new Date(prevStartOfDayIst.getTime() - istOffsetMs);
    previousEnd = currentStart;
    periodLabel = 'vs yesterday';
  } else if (range === '7d') {
    currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    previousEnd = currentStart;
    periodLabel = 'vs previous 7 days';
  } else if (range === '90d') {
    currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    previousStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    previousEnd = currentStart;
    periodLabel = 'vs previous 90 days';
  } else if (range === 'this_year') {
    const startOfYearIst = new Date(istNow);
    startOfYearIst.setUTCMonth(0, 1);
    startOfYearIst.setUTCHours(0, 0, 0, 0);
    currentStart = new Date(startOfYearIst.getTime() - istOffsetMs);

    const prevYearStart = new Date(startOfYearIst);
    prevYearStart.setUTCFullYear(prevYearStart.getUTCFullYear() - 1);
    previousStart = new Date(prevYearStart.getTime() - istOffsetMs);
    previousEnd = currentStart;
    periodLabel = 'vs previous year';
  } else if (range === 'custom' && startDateParam && endDateParam) {
    currentStart = new Date(startDateParam);
    currentEnd = new Date(endDateParam);
    const durationMs = currentEnd.getTime() - currentStart.getTime();
    previousStart = new Date(currentStart.getTime() - durationMs);
    previousEnd = currentStart;
    periodLabel = 'vs previous period';
  } else {
    // Default 30d
    currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    previousStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    previousEnd = currentStart;
    periodLabel = 'vs previous 30 days';
  }

  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    periodLabel,
  };
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(1));
}
