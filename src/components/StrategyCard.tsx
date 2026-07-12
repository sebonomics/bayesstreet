import { formatMoney, type StrategyResult } from '../lib/strategy'

type StrategyCardProps = {
  result: StrategyResult
}

const statusClassNames: Record<StrategyResult['status'], string> = {
  Enter: 'status-enter',
  Hold: 'status-hold',
  Exit: 'status-exit',
  Watch: 'status-watch',
}

function formatPercent(value: number | null) {
  return value === null ? 'Not enough data' : `${value.toFixed(1)}`
}

function formatPrice(value: number | null | undefined) {
  return value === null || value === undefined ? 'N/A' : formatMoney(value)
}

export function StrategyCard({ result }: StrategyCardProps) {
  return (
    <article className="strategy-card">
      <div className="strategy-card-header">
        <div>
          <strong>{result.symbol}</strong>
          <span>{result.name}</span>
        </div>
        <span className={`status-pill ${statusClassNames[result.status]}`}>
          {result.status}
        </span>
      </div>

      <p className="strategy-reason">{result.reason}</p>

      <div className="strategy-metrics" aria-label={`${result.symbol} strategy levels`}>
        <span>
          Price
          <strong>{formatMoney(result.currentPrice)}</strong>
        </span>
        <span>
          50D MA
          <strong>{formatPrice(result.movingAverage50)}</strong>
        </span>
        <span>
          RSI
          <strong>{formatPercent(result.rsi14)}</strong>
        </span>
        <span>
          Target
          <strong>{formatPrice(result.targetPrice)}</strong>
        </span>
        <span>
          Stop
          <strong>{formatPrice(result.stopPrice)}</strong>
        </span>
        <span>
          Held
          <strong>{result.daysHeld === undefined ? 'New' : `${result.daysHeld} days`}</strong>
        </span>
      </div>

      <p className="timeline-copy">{result.timeline}</p>
    </article>
  )
}
