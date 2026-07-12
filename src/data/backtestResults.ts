export type TickerBacktest = {
  ticker: string
  trades: number
  winRate: number
  averageReturn: number
  pnl: number
}

export type RecentTrade = {
  ticker: string
  entryDate: string
  exitDate: string
  daysHeld: number
  returnPct: number
  pnl: number
  exitReason: 'profit_target' | 'stop_loss' | 'below_ma50'
}

export const backtestSummary = {
  period: '2024-01-01 to current',
  tickerCount: 25,
  positionSize: 100_000,
  trades: 292,
  winRate: 36,
  averageReturn: 0.68,
  averageDaysHeld: 6.1,
  totalPnl: 198_280.89,
  profitTargets: 102,
  stopLosses: 131,
  maBreaks: 59,
}

export const tickerBacktests: TickerBacktest[] = [
  { ticker: 'AMZN', trades: 11, winRate: 63.64, averageReturn: 2.47, pnl: 27_189.19 },
  { ticker: 'XOM', trades: 14, winRate: 50, averageReturn: 1.73, pnl: 24_183.17 },
  { ticker: 'CAT', trades: 7, winRate: 71.43, averageReturn: 3, pnl: 21_000 },
  { ticker: 'NVDA', trades: 12, winRate: 50, averageReturn: 1.5, pnl: 18_000 },
  { ticker: 'HD', trades: 7, winRate: 71.43, averageReturn: 2.51, pnl: 17_549.82 },
  { ticker: 'COST', trades: 18, winRate: 33.33, averageReturn: 0.95, pnl: 17_099.51 },
  { ticker: 'AAPL', trades: 10, winRate: 50, averageReturn: 1.52, pnl: 15_248.67 },
  { ticker: 'ORCL', trades: 11, winRate: 45.45, averageReturn: 1.32, pnl: 14_489.89 },
  { ticker: 'BAC', trades: 8, winRate: 50, averageReturn: 1.79, pnl: 14_295.26 },
  { ticker: 'CRM', trades: 18, winRate: 33.33, averageReturn: 0.65, pnl: 11_757.31 },
  { ticker: 'UNH', trades: 13, winRate: 38.46, averageReturn: 0.85, pnl: 11_040.09 },
  { ticker: 'GOOGL', trades: 5, winRate: 60, averageReturn: 2.2, pnl: 11_000 },
  { ticker: 'GS', trades: 6, winRate: 50, averageReturn: 1.63, pnl: 9_802.82 },
  { ticker: 'PEP', trades: 12, winRate: 33.33, averageReturn: 0.81, pnl: 9_660.94 },
  { ticker: 'META', trades: 14, winRate: 35.71, averageReturn: 0.65, pnl: 9_098.79 },
  { ticker: 'JPM', trades: 7, winRate: 42.86, averageReturn: 1, pnl: 7_000 },
  { ticker: 'AVGO', trades: 12, winRate: 33.33, averageReturn: 0.38, pnl: 4_513.63 },
  { ticker: 'LLY', trades: 18, winRate: 33.33, averageReturn: 0.18, pnl: 3_224.09 },
  { ticker: 'MSFT', trades: 14, winRate: 28.57, averageReturn: -0.01, pnl: -187.22 },
  { ticker: 'WMT', trades: 9, winRate: 22.22, averageReturn: -0.2, pnl: -1_780.48 },
  { ticker: 'TSLA', trades: 17, winRate: 23.53, averageReturn: -0.35, pnl: -6_000 },
  { ticker: 'CVX', trades: 14, winRate: 14.29, averageReturn: -0.51, pnl: -7_192.63 },
  { ticker: 'NFLX', trades: 12, winRate: 16.67, averageReturn: -0.72, pnl: -8_589.23 },
  { ticker: 'NOW', trades: 9, winRate: 11.11, averageReturn: -0.95, pnl: -8_595.87 },
  { ticker: 'V', trades: 14, winRate: 7.14, averageReturn: -1.11, pnl: -15_526.86 },
]

export const recentTrades: RecentTrade[] = [
  {
    ticker: 'COST',
    entryDate: '2026-05-07',
    exitDate: '2026-05-11',
    daysHeld: 4,
    returnPct: -2,
    pnl: -2_000,
    exitReason: 'stop_loss',
  },
  {
    ticker: 'XOM',
    entryDate: '2026-05-15',
    exitDate: '2026-05-21',
    daysHeld: 6,
    returnPct: -2,
    pnl: -2_000,
    exitReason: 'stop_loss',
  },
  {
    ticker: 'CVX',
    entryDate: '2026-05-18',
    exitDate: '2026-05-20',
    daysHeld: 2,
    returnPct: -1.55,
    pnl: -1_548.83,
    exitReason: 'below_ma50',
  },
  {
    ticker: 'NOW',
    entryDate: '2026-05-18',
    exitDate: '2026-05-19',
    daysHeld: 1,
    returnPct: -2,
    pnl: -2_000,
    exitReason: 'stop_loss',
  },
  {
    ticker: 'META',
    entryDate: '2026-05-27',
    exitDate: '2026-06-01',
    daysHeld: 5,
    returnPct: -2,
    pnl: -2_000,
    exitReason: 'stop_loss',
  },
  {
    ticker: 'BAC',
    entryDate: '2026-05-29',
    exitDate: '2026-06-04',
    daysHeld: 6,
    returnPct: 5,
    pnl: 5_000,
    exitReason: 'profit_target',
  },
  {
    ticker: 'CRM',
    entryDate: '2026-05-29',
    exitDate: '2026-06-01',
    daysHeld: 3,
    returnPct: 5,
    pnl: 5_000,
    exitReason: 'profit_target',
  },
  {
    ticker: 'JPM',
    entryDate: '2026-06-04',
    exitDate: '2026-06-16',
    daysHeld: 12,
    returnPct: 5,
    pnl: 5_000,
    exitReason: 'profit_target',
  },
  {
    ticker: 'HD',
    entryDate: '2026-06-11',
    exitDate: '2026-06-24',
    daysHeld: 13,
    returnPct: 5,
    pnl: 5_000,
    exitReason: 'profit_target',
  },
  {
    ticker: 'TSLA',
    entryDate: '2026-06-29',
    exitDate: '2026-07-01',
    daysHeld: 2,
    returnPct: 5,
    pnl: 5_000,
    exitReason: 'profit_target',
  },
  {
    ticker: 'AAPL',
    entryDate: '2026-07-01',
    exitDate: '2026-07-02',
    daysHeld: 1,
    returnPct: 5,
    pnl: 5_000,
    exitReason: 'profit_target',
  },
  {
    ticker: 'META',
    entryDate: '2026-07-07',
    exitDate: '2026-07-08',
    daysHeld: 1,
    returnPct: -2,
    pnl: -2_000,
    exitReason: 'stop_loss',
  },
]
