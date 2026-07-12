# Trading Bot Build Instructions

Build this in stages. Do not start with live trading.

## Strategy

Trade daily bars first.

Entry:

- Buy when price crosses above the 50-day moving average.
- RSI must be above 50.
- Enter near the close of the signal day or the next market open.

Exit:

- Sell at a 5% profit target.
- Sell at a 2% stop loss.
- Sell if price closes below the 50-day moving average.

Position sizing:

- Start with equal-sized positions.
- Example: with $500k, use 5 positions of $100k each.
- Do not put the whole account into one stock.

## Phase 1: Backtesting

Goal: prove whether this worked from 2024 to now across many tickers.

Use:

- Python
- `yfinance`
- `pandas`
- `numpy`

Run:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-backtest.txt
python scripts/backtest_ma_rsi.py
```

Important outputs:

- Total trades
- Win rate
- Average return per trade
- Average days held
- P&L by ticker
- Exit reasons

Do not trust one ticker. Test at least 20-50 liquid large-cap stocks.

## Phase 2: Paper Trading

Goal: test the strategy live with fake money.

Use Alpaca paper trading first.

The bot should:

- Pull recent daily prices every morning and near market close.
- Calculate MA50 and RSI14.
- Check open positions.
- Create buy signals.
- Create sell signals.
- Log every decision.
- Send alerts before placing orders.

At this stage, keep human approval on trades.

## Phase 3: Small Live Trading

Goal: trade real money carefully.

Requirements before this phase:

- At least 2-3 months of paper trading logs.
- Backtest results across multiple market conditions.
- Clear max loss rules.
- Clear position limits.
- Broker API tested with tiny orders.

Risk rules:

- Max 5 open positions.
- Max 20% of capital per position.
- Max daily loss limit.
- No trading if data is missing or stale.
- No trading around broken API responses.

## Phase 4: Production Bot

Build:

- Python backend
- Broker connection
- Database for trades and signals
- React dashboard
- Alerts by email, SMS, or Slack
- Daily report

Recommended providers:

- Historical/backtest data: Yahoo Finance for early testing.
- Paper trading: Alpaca.
- Production data: Polygon or Interactive Brokers.
- Execution: Alpaca or Interactive Brokers.

## Do We Need Live Data?

For backtesting: no.

Use historical daily data.

For paper trading: yes.

You need current prices and a paper broker account.

For live trading: yes.

You need reliable real-time or near-real-time data plus broker execution.

## Bot Prompt

Give another bot this:

```text
Build a Python trading research system for a MA50 + RSI14 momentum strategy.

Rules:
- Universe: liquid large-cap stocks.
- Entry: buy when the daily close crosses above the 50-day moving average and RSI14 is above 50.
- Exit: sell at +5%, sell at -2%, or sell when daily close falls below the 50-day moving average.
- Start with daily bars only.
- Backtest from 2024-01-01 to current date.
- Use yfinance for historical data first.
- Output total trades, win rate, average return, average hold time, P&L by ticker, and trade log CSV.
- Keep strategy logic separate from broker/execution logic.
- Do not place live trades.

After backtesting works, add paper trading using Alpaca:
- Pull latest market data.
- Calculate signals.
- Track positions.
- Log every decision.
- Send alerts.
- Require human approval before orders.
```
