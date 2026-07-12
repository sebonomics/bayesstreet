import { useEffect, useMemo, useState } from 'react'
import { generatedBacktest } from '../data/generatedBacktest'
import { formatMoney } from '../lib/strategy'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

type ScannerStatus = 'entry_signal' | 'exit_signal' | 'open_position' | 'trend_break' | 'watch'

type ScannerItem = {
  ticker: string
  date: string
  status: ScannerStatus
  currentPrice: number
  ma50: number | null
  rsi14: number | null
  targetPrice: number | null
  stopPrice: number | null
}

type TradeItem = {
  ticker: string
  entry_date: string
  exit_date: string
  days_held: number
  entry_price: number
  exit_price: number
  return_pct: number
  pnl: number
  exit_reason: 'profit_target' | 'stop_loss' | 'below_ma50'
}

type MonthlyReturn = {
  month: string
  trades: number
  winRate: number
  pnl: number
  returnOnDeployedCapital: number
}

type LiveDashboardData = {
  generatedAt: string
  scanner: ScannerItem[]
}

type PaperPosition = {
  ticker: string
  entryDate: string
  entryPrice: number
  currentPrice: number
  targetPrice: number
  stopPrice: number
  shares: number
  unrealizedPnl: number
}

type PaperTrade = {
  ticker: string
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  pnl: number
  returnPct: number
  reason: string
}

type PaperTradingData = {
  updatedAt: string | null
  startingCash: number
  cash: number
  equity: number
  totalPnl: number
  realizedPnl: number
  maxPositions: number
  positionSize: number
  positions: PaperPosition[]
  trades: PaperTrade[]
  skippedSignals: Array<{ ticker: string; date: string; reason: string }>
}

const statusLabels: Record<ScannerStatus, string> = {
  entry_signal: 'Buy',
  exit_signal: 'Exit',
  open_position: 'Open',
  trend_break: 'Break',
  watch: 'Watch',
}

const exitReasonLabels: Record<TradeItem['exit_reason'], string> = {
  below_ma50: 'MA break',
  profit_target: 'Target',
  stop_loss: 'Stop',
}

function formatSignedMoney(value: number) {
  return `${value >= 0 ? '+' : ''}${formatMoney(value)}`
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${numberFormatter.format(value)}%`
}

export function BacktestDashboard() {
  const [liveData, setLiveData] = useState<LiveDashboardData | null>(null)
  const [liveError, setLiveError] = useState('')
  const [paperData, setPaperData] = useState<PaperTradingData | null>(null)
  const [paperError, setPaperError] = useState('')
  const [scannerFilter, setScannerFilter] = useState<ScannerStatus | 'all'>('all')
  const { summary } = generatedBacktest
  const trades = generatedBacktest.trades as readonly TradeItem[]
  const monthlyReturns = generatedBacktest.monthly as readonly MonthlyReturn[]
  const scanner = (liveData?.scanner ??
    generatedBacktest.scanner) as readonly ScannerItem[]
  const filteredScanner = useMemo(
    () =>
      scannerFilter === 'all'
        ? scanner
        : scanner.filter((item) => item.status === scannerFilter),
    [scanner, scannerFilter],
  )
  const buyCount = scanner.filter((item) => item.status === 'entry_signal').length
  const openCount = scanner.filter((item) => item.status === 'open_position').length
  const breakCount = scanner.filter(
    (item) => item.status === 'trend_break' || item.status === 'exit_signal',
  ).length
  const recentTrades = trades.slice(-80).reverse()

  useEffect(() => {
    let cancelled = false

    async function loadLiveData() {
      try {
        const response = await fetch(`/live-dashboard.json?t=${Date.now()}`)

        if (!response.ok) {
          throw new Error('live scanner not running')
        }

        const nextLiveData = (await response.json()) as LiveDashboardData

        if (!cancelled) {
          setLiveData(nextLiveData)
          setLiveError('')
        }
      } catch (error) {
        if (!cancelled) {
          setLiveError(error instanceof Error ? error.message : 'live scanner unavailable')
        }
      }
    }

    loadLiveData()
    const intervalId = window.setInterval(loadLiveData, 15_000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPaperData() {
      try {
        const response = await fetch(`/paper-trading.json?t=${Date.now()}`)

        if (!response.ok) {
          throw new Error('paper trader not running')
        }

        const nextPaperData = (await response.json()) as PaperTradingData

        if (!cancelled) {
          setPaperData(nextPaperData)
          setPaperError('')
        }
      } catch (error) {
        if (!cancelled) {
          setPaperError(error instanceof Error ? error.message : 'paper trader unavailable')
        }
      }
    }

    loadPaperData()
    const intervalId = window.setInterval(loadPaperData, 15_000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <section className="signals-page">
      <header className="signals-header">
        <div>
          <h1>Live Signals</h1>
          <p>
            Updated: {liveData?.generatedAt ?? 'waiting'}
            {liveError ? ` | ${liveError}` : ''}
          </p>
        </div>
        <div className="signal-counts">
          <span>Buy {buyCount}</span>
          <span>Open {openCount}</span>
          <span>Break {breakCount}</span>
          <span>Total {scanner.length}</span>
        </div>
      </header>

      <div className="filter-pills" aria-label="Signal filters">
        {(['all', 'entry_signal', 'open_position', 'trend_break', 'watch'] as const).map(
          (filter) => (
            <button
              className={scannerFilter === filter ? 'filter-pill active' : 'filter-pill'}
              key={filter}
              onClick={() => setScannerFilter(filter)}
              type="button"
            >
              {filter === 'all' ? 'All' : statusLabels[filter]}
            </button>
          ),
        )}
      </div>

      <div className="signals-table-wrap">
        <div className="signals-table">
          <div className="signals-row signals-head">
            <span>Ticker</span>
            <span>Signal</span>
            <span>Price</span>
            <span>MA50</span>
            <span>RSI</span>
            <span>Target</span>
            <span>Stop</span>
            <span>Date</span>
          </div>
          {filteredScanner.map((item) => (
            <div className="signals-row" key={item.ticker}>
              <strong>{item.ticker}</strong>
              <span className={`status-pill status-${item.status}`}>
                {statusLabels[item.status]}
              </span>
              <span>{formatMoney(item.currentPrice)}</span>
              <span>{item.ma50 === null ? 'N/A' : formatMoney(item.ma50)}</span>
              <span>{item.rsi14 === null ? 'N/A' : numberFormatter.format(item.rsi14)}</span>
              <span>{item.targetPrice === null ? 'N/A' : formatMoney(item.targetPrice)}</span>
              <span>{item.stopPrice === null ? 'N/A' : formatMoney(item.stopPrice)}</span>
              <span>{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="proof-section">
        <header className="proof-header">
          <h2>Paper Trading</h2>
          <p>
            Updated: {paperData?.updatedAt ?? 'waiting'}
            {paperError ? ` | ${paperError}` : ''}
          </p>
        </header>

        <div className="proof-stats">
          <span>Equity: {formatMoney(paperData?.equity ?? 0)}</span>
          <span>Cash: {formatMoney(paperData?.cash ?? 0)}</span>
          <span>Total P&L: {formatSignedMoney(paperData?.totalPnl ?? 0)}</span>
          <span>Realized: {formatSignedMoney(paperData?.realizedPnl ?? 0)}</span>
          <span>
            Positions: {paperData?.positions.length ?? 0}/{paperData?.maxPositions ?? 5}
          </span>
        </div>

        <div className="signals-table-wrap">
          <div className="paper-positions-table">
            <div className="paper-positions-row signals-head">
              <span>Ticker</span>
              <span>Entry</span>
              <span>Price</span>
              <span>Target</span>
              <span>Stop</span>
              <span>Unrealized</span>
            </div>
            {(paperData?.positions ?? []).map((position) => (
              <div className="paper-positions-row" key={position.ticker}>
                <strong>{position.ticker}</strong>
                <span>{formatMoney(position.entryPrice)}</span>
                <span>{formatMoney(position.currentPrice)}</span>
                <span>{formatMoney(position.targetPrice)}</span>
                <span>{formatMoney(position.stopPrice)}</span>
                <span className={position.unrealizedPnl >= 0 ? 'up' : 'down'}>
                  {formatSignedMoney(position.unrealizedPnl)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="signals-table-wrap">
          <div className="paper-trades-table">
            <div className="paper-trades-row signals-head">
              <span>Ticker</span>
              <span>Entry</span>
              <span>Exit</span>
              <span>Return</span>
              <span>P&L</span>
              <span>Reason</span>
            </div>
            {(paperData?.trades ?? []).slice(-25).reverse().map((trade) => (
              <div
                className="paper-trades-row"
                key={`${trade.ticker}-${trade.entryDate}-${trade.exitDate}`}
              >
                <strong>{trade.ticker}</strong>
                <span>{trade.entryDate}</span>
                <span>{trade.exitDate}</span>
                <span className={trade.returnPct >= 0 ? 'up' : 'down'}>
                  {formatSignedPercent(trade.returnPct)}
                </span>
                <span className={trade.pnl >= 0 ? 'up' : 'down'}>
                  {formatSignedMoney(trade.pnl)}
                </span>
                <span>{trade.reason}</span>
              </div>
            ))}
          </div>
        </div>

        {(paperData?.skippedSignals.length ?? 0) > 0 ? (
          <div className="skipped-signals">
            Skipped:{' '}
            {paperData?.skippedSignals
              .map((signal) => `${signal.ticker} (${signal.reason})`)
              .join(', ')}
          </div>
        ) : null}
      </section>

      <section className="proof-section">
        <header className="proof-header">
          <h2>Backtest Proof</h2>
          <p>
            {summary.strategyName} | {summary.period} | {summary.trades} trades |{' '}
            {formatMoney(summary.positionSize)} per trade
          </p>
        </header>

        <div className="proof-stats">
          <span>Total P&L: {formatSignedMoney(summary.totalPnl)}</span>
          <span>Win rate: {numberFormatter.format(summary.winRate)}%</span>
          <span>Avg trade: {formatSignedPercent(summary.averageReturn)}</span>
          <span>Avg hold: {summary.averageDaysHeld}d</span>
          <span>Targets: {summary.profitTargets}</span>
          <span>Stops: {summary.stopLosses}</span>
        </div>

        <div className="signals-table-wrap">
          <div className="monthly-table">
            <div className="monthly-row signals-head">
              <span>Month</span>
              <span>Trades</span>
              <span>Win Rate</span>
              <span>Total P&L</span>
              <span>Return</span>
            </div>
            {monthlyReturns.map((month) => (
              <div className="monthly-row" key={month.month}>
                <strong>{month.month}</strong>
                <span>{month.trades}</span>
                <span>{numberFormatter.format(month.winRate)}%</span>
                <span className={month.pnl >= 0 ? 'up' : 'down'}>
                  {formatSignedMoney(month.pnl)}
                </span>
                <span className={month.returnOnDeployedCapital >= 0 ? 'up' : 'down'}>
                  {formatSignedPercent(month.returnOnDeployedCapital)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="signals-table-wrap">
          <div className="trades-table">
            <div className="trades-row signals-head">
              <span>Ticker</span>
              <span>Entry</span>
              <span>Exit</span>
              <span>Held</span>
              <span>Entry Px</span>
              <span>Exit Px</span>
              <span>Return</span>
              <span>P&L</span>
              <span>Reason</span>
            </div>
            {recentTrades.map((trade) => (
              <div
                className="trades-row"
                key={`${trade.ticker}-${trade.entry_date}-${trade.exit_date}`}
              >
                <strong>{trade.ticker}</strong>
                <span>{trade.entry_date}</span>
                <span>{trade.exit_date}</span>
                <span>{trade.days_held}d</span>
                <span>{formatMoney(trade.entry_price)}</span>
                <span>{formatMoney(trade.exit_price)}</span>
                <span className={trade.return_pct >= 0 ? 'up' : 'down'}>
                  {formatSignedPercent(trade.return_pct)}
                </span>
                <span className={trade.pnl >= 0 ? 'up' : 'down'}>
                  {formatSignedMoney(trade.pnl)}
                </span>
                <span>{exitReasonLabels[trade.exit_reason]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  )
}
