# Bayesstreet

Bayesstreet is a hedge fund style stock analyzer. The current app is a React
and TypeScript front end with a static dashboard shell for watchlists, stock
signals, and factor scoring.

## Run locally

```bash
npm install
npm run dev
```

## Run the live dashboard

Use two terminals:

```bash
npm run dev
```

```bash
source .venv/bin/activate
npm run scan:live
```

The scanner writes `public/live-dashboard.json` every 60 seconds. The React app
polls that file every 15 seconds.

## Useful commands

```bash
npm run build
npm run lint
```

## Strategy

This app models a simple short-term momentum strategy.

1. Entry: buy when price crosses above the 50-day moving average and RSI is above 50.
2. Hold: usually 3-7 days, checking the position once or twice per day.
3. Exit: sell at a 5% profit target, a 2% stop loss, or when price falls back below the 50-day moving average.

The current version uses sample price data. Real market data can be added later through an API or uploaded price history.

## Backtest

Run a 2024-to-current backtest across liquid large-cap stocks:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-backtest.txt
python scripts/backtest_ma_rsi.py
```

The script writes:

- `backtest_results.csv` for the full trade log.
- `src/data/generatedBacktest.ts` for the dashboard.

After running the script, refresh the app to see the newest scanner state.

Bot build notes are in `docs/BOT_BUILD_INSTRUCTIONS.md`.
