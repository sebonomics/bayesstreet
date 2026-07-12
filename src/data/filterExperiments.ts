export const filterExperiments = [
  {
    "name": "Baseline",
    "trades": 1616,
    "winRate": 34.9,
    "averageReturn": 0.48,
    "averageWinner": 4.94,
    "averageLoser": -1.92,
    "averageDaysHeld": 6.4,
    "totalPnl": 771067.3
  },
  {
    "name": "Stock above MA200",
    "trades": 1422,
    "winRate": 35.51,
    "averageReturn": 0.51,
    "averageWinner": 4.93,
    "averageLoser": -1.93,
    "averageDaysHeld": 6.7,
    "totalPnl": 720096.52
  },
  {
    "name": "SPY above MA50",
    "trades": 1474,
    "winRate": 35.28,
    "averageReturn": 0.51,
    "averageWinner": 4.96,
    "averageLoser": -1.91,
    "averageDaysHeld": 6.7,
    "totalPnl": 753355.49
  },
  {
    "name": "SPY above MA200",
    "trades": 1547,
    "winRate": 34.71,
    "averageReturn": 0.46,
    "averageWinner": 4.94,
    "averageLoser": -1.92,
    "averageDaysHeld": 6.5,
    "totalPnl": 715808.36
  },
  {
    "name": "5-day cooldown",
    "trades": 1236,
    "winRate": 35.28,
    "averageReturn": 0.5,
    "averageWinner": 4.96,
    "averageLoser": -1.93,
    "averageDaysHeld": 6.8,
    "totalPnl": 620130.57
  },
  {
    "name": "RSI >= 55",
    "trades": 1425,
    "winRate": 35.44,
    "averageReturn": 0.51,
    "averageWinner": 4.95,
    "averageLoser": -1.93,
    "averageDaysHeld": 6.6,
    "totalPnl": 721498.6
  },
  {
    "name": "Price within 2% of MA50",
    "trades": 398,
    "winRate": 33.92,
    "averageReturn": 0.55,
    "averageWinner": 4.79,
    "averageLoser": -1.64,
    "averageDaysHeld": 6.3,
    "totalPnl": 217000.72
  },
  {
    "name": "Price within 1% of MA50",
    "trades": 250,
    "winRate": 31.6,
    "averageReturn": 0.51,
    "averageWinner": 4.7,
    "averageLoser": -1.43,
    "averageDaysHeld": 5.5,
    "totalPnl": 126770.05
  },
  {
    "name": "Stock MA200 + within 2% of MA50",
    "trades": 289,
    "winRate": 34.95,
    "averageReturn": 0.58,
    "averageWinner": 4.72,
    "averageLoser": -1.65,
    "averageDaysHeld": 6.6,
    "totalPnl": 167591.78
  },
  {
    "name": "SPY MA50 + within 2% of MA50",
    "trades": 338,
    "winRate": 33.73,
    "averageReturn": 0.55,
    "averageWinner": 4.8,
    "averageLoser": -1.6,
    "averageDaysHeld": 6.4,
    "totalPnl": 187255.9
  },
  {
    "name": "Stock MA200 + SPY MA200 + cooldown",
    "trades": 1063,
    "winRate": 35.18,
    "averageReturn": 0.49,
    "averageWinner": 4.95,
    "averageLoser": -1.94,
    "averageDaysHeld": 7.2,
    "totalPnl": 516949.2
  }
] as const
