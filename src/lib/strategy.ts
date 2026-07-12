export type PriceBar = {
  date: string
  close: number
}

export type OpenPosition = {
  entryDate: string
  entryPrice: number
}

export type StockSetup = {
  symbol: string
  name: string
  bars: PriceBar[]
  position?: OpenPosition
}

export type StrategyStatus = 'Enter' | 'Hold' | 'Exit' | 'Watch'

export type StrategyResult = {
  symbol: string
  name: string
  status: StrategyStatus
  reason: string
  currentPrice: number
  movingAverage50: number | null
  rsi14: number | null
  targetPrice?: number
  stopPrice?: number
  entryPrice?: number
  daysHeld?: number
  timeline: string
}

const MONEY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: 'currency',
})

export const formatMoney = (value: number) => MONEY_FORMATTER.format(value)

export function calculateMovingAverage(
  bars: PriceBar[],
  windowSize: number,
  index = bars.length - 1,
) {
  const startIndex = index - windowSize + 1

  if (startIndex < 0 || index >= bars.length) {
    return null
  }

  const window = bars.slice(startIndex, index + 1)
  const total = window.reduce((sum, bar) => sum + bar.close, 0)

  return total / windowSize
}

export function calculateRsi(bars: PriceBar[], period = 14, index = bars.length - 1) {
  if (index - period < 0 || index >= bars.length) {
    return null
  }

  let gains = 0
  let losses = 0

  for (let i = index - period + 1; i <= index; i += 1) {
    const change = bars[i].close - bars[i - 1].close

    if (change >= 0) {
      gains += change
    } else {
      losses += Math.abs(change)
    }
  }

  if (losses === 0) {
    return 100
  }

  const relativeStrength = gains / losses

  return 100 - 100 / (1 + relativeStrength)
}

export function hasFreshEntrySignal(bars: PriceBar[], windowSize = 50) {
  const currentIndex = bars.length - 1
  const previousIndex = currentIndex - 1
  const currentAverage = calculateMovingAverage(bars, windowSize, currentIndex)
  const previousAverage = calculateMovingAverage(bars, windowSize, previousIndex)
  const currentRsi = calculateRsi(bars, 14, currentIndex)
  const previousRsi = calculateRsi(bars, 14, previousIndex)

  if (
    currentAverage === null ||
    previousAverage === null ||
    currentRsi === null ||
    previousRsi === null ||
    previousIndex < 0
  ) {
    return false
  }

  const previousClose = bars[previousIndex].close
  const currentClose = bars[currentIndex].close
  const setupReadyToday = currentClose >= currentAverage && currentRsi >= 50
  const setupWasReadyYesterday = previousClose >= previousAverage && previousRsi >= 50

  return setupReadyToday && !setupWasReadyYesterday
}

export function evaluateStrategy(setup: StockSetup): StrategyResult {
  const currentBar = setup.bars.at(-1)

  if (!currentBar) {
    throw new Error(`${setup.symbol} needs at least one price bar`)
  }

  const currentPrice = currentBar.close
  const movingAverage50 = calculateMovingAverage(setup.bars, 50)
  const rsi14 = calculateRsi(setup.bars)
  const isEntrySignal =
    movingAverage50 !== null &&
    rsi14 !== null &&
    hasFreshEntrySignal(setup.bars) &&
    currentPrice >= movingAverage50 &&
    rsi14 >= 50

  if (!setup.position) {
    return {
      symbol: setup.symbol,
      name: setup.name,
      status: isEntrySignal ? 'Enter' : 'Watch',
      reason: isEntrySignal
        ? 'The setup just became active: price is at or above MA50 and RSI is at or above 50.'
        : 'No fresh entry. If it was already above MA50 and RSI50, do nothing.',
      currentPrice,
      movingAverage50,
      rsi14,
      targetPrice: currentPrice * 1.05,
      stopPrice: currentPrice * 0.98,
      timeline: isEntrySignal
        ? `Buy today near ${formatMoney(currentPrice)}, set target at ${formatMoney(
            currentPrice * 1.05,
          )}, and set stop at ${formatMoney(currentPrice * 0.98)}.`
        : 'Do nothing today. Check again tomorrow.',
    }
  }

  const targetPrice = setup.position.entryPrice * 1.05
  const stopPrice = setup.position.entryPrice * 0.98
  const entryIndex = setup.bars.findIndex((bar) => bar.date === setup.position?.entryDate)
  const daysHeld = entryIndex >= 0 ? setup.bars.length - 1 - entryIndex : undefined

  if (currentPrice >= targetPrice) {
    return {
      symbol: setup.symbol,
      name: setup.name,
      status: 'Exit',
      reason: 'Target hit. Take the 5% win and close the trade.',
      currentPrice,
      movingAverage50,
      rsi14,
      entryPrice: setup.position.entryPrice,
      targetPrice,
      stopPrice,
      daysHeld,
      timeline: `Sell today near ${formatMoney(targetPrice)}. The trade reached the profit target.`,
    }
  }

  if (currentPrice <= stopPrice) {
    return {
      symbol: setup.symbol,
      name: setup.name,
      status: 'Exit',
      reason: 'Stop loss hit. Take the small loss and close the trade.',
      currentPrice,
      movingAverage50,
      rsi14,
      entryPrice: setup.position.entryPrice,
      targetPrice,
      stopPrice,
      daysHeld,
      timeline: `Sell today near ${formatMoney(stopPrice)}. The trade hit the risk limit.`,
    }
  }

  if (movingAverage50 !== null && currentPrice < movingAverage50) {
    return {
      symbol: setup.symbol,
      name: setup.name,
      status: 'Exit',
      reason: 'Price fell back below the 50-day average.',
      currentPrice,
      movingAverage50,
      rsi14,
      entryPrice: setup.position.entryPrice,
      targetPrice,
      stopPrice,
      daysHeld,
      timeline: 'Sell today at the current price. The setup broke down.',
    }
  }

  return {
    symbol: setup.symbol,
    name: setup.name,
    status: 'Hold',
    reason: 'Trade is still between the stop and target.',
    currentPrice,
    movingAverage50,
    rsi14,
    entryPrice: setup.position.entryPrice,
    targetPrice,
    stopPrice,
    daysHeld,
    timeline: 'Keep holding. Check again tomorrow.',
  }
}
