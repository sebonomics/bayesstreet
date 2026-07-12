from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import numpy as np
import pandas as pd
import yfinance as yf


DEFAULT_TICKERS = [
    "AAPL",
    "AMZN",
    "AVGO",
    "BAC",
    "CAT",
    "COST",
    "CRM",
    "CVX",
    "GOOGL",
    "GS",
    "HD",
    "JPM",
    "LLY",
    "META",
    "MSFT",
    "NFLX",
    "NOW",
    "NVDA",
    "ORCL",
    "PEP",
    "TSLA",
    "UNH",
    "V",
    "WMT",
    "XOM",
]


@dataclass
class Trade:
    ticker: str
    entry_date: pd.Timestamp
    exit_date: pd.Timestamp
    entry_price: float
    exit_price: float
    exit_reason: str

    @property
    def return_pct(self) -> float:
        return self.exit_price / self.entry_price - 1

    @property
    def days_held(self) -> int:
        return max((self.exit_date - self.entry_date).days, 1)


@dataclass
class OpenTrade:
    ticker: str
    entry_date: pd.Timestamp
    entry_price: float

    @property
    def target_price(self) -> float:
        return self.entry_price * 1.05

    @property
    def stop_price(self) -> float:
        return self.entry_price * 0.98


def calculate_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    change = close.diff()
    gain = change.where(change > 0, 0).rolling(period).mean()
    loss = (-change.where(change < 0, 0)).rolling(period).mean()
    relative_strength = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + relative_strength))

    return rsi.fillna(100)


def download_data(tickers: list[str], start: str, end: str) -> dict[str, pd.DataFrame]:
    raw = yf.download(
        tickers,
        start=start,
        end=end,
        auto_adjust=True,
        group_by="ticker",
        progress=False,
        threads=False,
    )

    data: dict[str, pd.DataFrame] = {}

    for ticker in tickers:
        if len(tickers) == 1:
            frame = raw.copy()
        else:
            if ticker not in raw.columns.get_level_values(0):
                continue
            frame = raw[ticker].copy()

        frame = frame.dropna(subset=["Close"])

        if len(frame) >= 70:
            data[ticker] = frame

    return data


def add_indicators(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()
    frame["ma50"] = frame["Close"].rolling(50).mean()
    frame["rsi14"] = calculate_rsi(frame["Close"])
    frame["setup_ready"] = (frame["Close"] >= frame["ma50"]) & (frame["rsi14"] >= 50)
    frame["fresh_entry_signal"] = frame["setup_ready"] & ~frame["setup_ready"].shift(1).fillna(False)

    return frame


def passes_market_filter(current_date: pd.Timestamp, spy: pd.DataFrame | None) -> bool:
    if spy is None:
        return True

    if current_date not in spy.index:
        return False

    spy_row = spy.loc[current_date]

    return bool(spy_row["Close"] >= spy_row["ma50"])


def backtest_ticker(
    ticker: str,
    frame: pd.DataFrame,
    spy: pd.DataFrame | None = None,
) -> tuple[list[Trade], OpenTrade | None]:
    frame = add_indicators(frame)

    trades: list[Trade] = []
    open_trade: tuple[pd.Timestamp, float] | None = None

    for current_date, row in frame.iterrows():
        if open_trade is None:
            if bool(row["fresh_entry_signal"]) and passes_market_filter(current_date, spy):
                open_trade = (current_date, float(row["Close"]))
            continue

        entry_date, entry_price = open_trade
        target_price = entry_price * 1.05
        stop_price = entry_price * 0.98
        exit_price: float | None = None
        exit_reason: str | None = None

        # Conservative daily-bar assumption: if stop and target both hit, stop wins.
        if float(row["Low"]) <= stop_price:
            exit_price = stop_price
            exit_reason = "stop_loss"
        elif float(row["High"]) >= target_price:
            exit_price = target_price
            exit_reason = "profit_target"
        elif float(row["Close"]) < float(row["ma50"]):
            exit_price = float(row["Close"])
            exit_reason = "below_ma50"

        if exit_price is not None and exit_reason is not None:
            trades.append(
                Trade(
                    ticker=ticker,
                    entry_date=entry_date,
                    exit_date=current_date,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    exit_reason=exit_reason,
                )
            )
            open_trade = None

    if open_trade is None:
        return trades, None

    entry_date, entry_price = open_trade

    return trades, OpenTrade(ticker=ticker, entry_date=entry_date, entry_price=entry_price)


def summarize_trades(trades: list[Trade], position_size: float) -> pd.DataFrame:
    rows = [
        {
            "ticker": trade.ticker,
            "entry_date": trade.entry_date.date().isoformat(),
            "exit_date": trade.exit_date.date().isoformat(),
            "days_held": trade.days_held,
            "entry_price": round(trade.entry_price, 2),
            "exit_price": round(trade.exit_price, 2),
            "return_pct": round(trade.return_pct * 100, 2),
            "pnl": round(position_size * trade.return_pct, 2),
            "exit_reason": trade.exit_reason,
        }
        for trade in trades
    ]

    return pd.DataFrame(rows)


def build_ticker_summary(results: pd.DataFrame, tickers: list[str]) -> list[dict]:
    summaries: list[dict] = []

    for ticker in tickers:
        ticker_results = results[results["ticker"] == ticker] if not results.empty else pd.DataFrame()

        if ticker_results.empty:
            summaries.append(
                {
                    "ticker": ticker,
                    "trades": 0,
                    "winRate": 0,
                    "averageReturn": 0,
                    "averageHoldDays": 0,
                    "pnl": 0,
                    "profitTargets": 0,
                    "stopLosses": 0,
                    "maBreaks": 0,
                }
            )
            continue

        summaries.append(
            {
                "ticker": ticker,
                "trades": int(len(ticker_results)),
                "winRate": round(float((ticker_results["return_pct"] > 0).mean() * 100), 2),
                "averageReturn": round(float(ticker_results["return_pct"].mean()), 2),
                "averageHoldDays": round(float(ticker_results["days_held"].mean()), 1),
                "pnl": round(float(ticker_results["pnl"].sum()), 2),
                "profitTargets": int((ticker_results["exit_reason"] == "profit_target").sum()),
                "stopLosses": int((ticker_results["exit_reason"] == "stop_loss").sum()),
                "maBreaks": int((ticker_results["exit_reason"] == "below_ma50").sum()),
            }
        )

    return sorted(summaries, key=lambda item: item["pnl"], reverse=True)


def build_monthly_summary(results: pd.DataFrame, position_size: float) -> list[dict]:
    if results.empty:
        return []

    monthly = results.copy()
    monthly["month"] = pd.to_datetime(monthly["exit_date"]).dt.to_period("M").astype(str)

    rows = []

    for month, month_results in monthly.groupby("month"):
        winners = month_results[month_results["return_pct"] > 0]
        pnl = float(month_results["pnl"].sum())
        deployed = float(len(month_results) * position_size)
        rows.append(
            {
                "month": month,
                "trades": int(len(month_results)),
                "winRate": round(float(len(winners) / len(month_results) * 100), 2),
                "pnl": round(pnl, 2),
                "returnOnDeployedCapital": round(float(pnl / deployed * 100), 2)
                if deployed > 0
                else 0,
            }
        )

    return rows


def build_scanner(
    data: dict[str, pd.DataFrame],
    open_trades: dict[str, OpenTrade],
    position_size: float,
) -> list[dict]:
    scanner: list[dict] = []

    for ticker, frame in data.items():
        frame = add_indicators(frame)
        latest = frame.iloc[-1]
        current_price = float(latest["Close"])
        ma50 = None if pd.isna(latest["ma50"]) else float(latest["ma50"])
        rsi14 = None if pd.isna(latest["rsi14"]) else float(latest["rsi14"])
        has_entry_signal = bool(latest["fresh_entry_signal"])
        open_trade = open_trades.get(ticker)
        status = "watch"
        action = "Do nothing"
        pnl = 0.0
        return_pct = 0.0
        entry_date = None
        entry_price = None
        target_price = None
        stop_price = None

        if open_trade is not None:
            entry_date = open_trade.entry_date.date().isoformat()
            entry_price = open_trade.entry_price
            target_price = open_trade.target_price
            stop_price = open_trade.stop_price
            return_pct = current_price / entry_price - 1
            pnl = position_size * return_pct

            if current_price >= target_price:
                status = "exit_signal"
                action = "Sell: profit target hit"
            elif current_price <= stop_price:
                status = "exit_signal"
                action = "Sell: stop loss hit"
            elif ma50 is not None and current_price < ma50:
                status = "exit_signal"
                action = "Sell: below 50-day MA"
            else:
                status = "open_position"
                action = "Hold"
        elif has_entry_signal:
            status = "entry_signal"
            action = "Buy candidate"
            target_price = current_price * 1.05
            stop_price = current_price * 0.98

        scanner.append(
            {
                "ticker": ticker,
                "date": frame.index[-1].date().isoformat(),
                "status": status,
                "action": action,
                "currentPrice": round(current_price, 2),
                "ma50": None if ma50 is None else round(ma50, 2),
                "rsi14": None if rsi14 is None else round(rsi14, 1),
                "entryDate": entry_date,
                "entryPrice": None if entry_price is None else round(entry_price, 2),
                "targetPrice": None if target_price is None else round(target_price, 2),
                "stopPrice": None if stop_price is None else round(stop_price, 2),
                "unrealizedReturnPct": round(return_pct * 100, 2),
                "unrealizedPnl": round(pnl, 2),
            }
        )

    order = {"exit_signal": 0, "entry_signal": 1, "open_position": 2, "watch": 3}

    return sorted(scanner, key=lambda item: (order[item["status"]], item["ticker"]))


def build_dashboard_data(
    results: pd.DataFrame,
    data: dict[str, pd.DataFrame],
    open_trades: dict[str, OpenTrade],
    args: argparse.Namespace,
) -> dict:
    if results.empty:
        summary = {
            "period": f"{args.start} to {args.end}",
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
            "strategyName": "Fresh MA50 + RSI50 signal, SPY above MA50",
            "tickerCount": len(data),
            "positionSize": args.position_size,
            "trades": 0,
            "winRate": 0,
            "averageReturn": 0,
            "averageWinner": 0,
            "averageLoser": 0,
            "averageDaysHeld": 0,
            "totalPnl": 0,
            "profitTargets": 0,
            "stopLosses": 0,
            "maBreaks": 0,
            "openPositions": len(open_trades),
            "entrySignals": 0,
            "exitSignals": 0,
        }
        tickers = build_ticker_summary(results, list(data.keys()))
        trades: list[dict] = []
    else:
        winners = results[results["return_pct"] > 0]
        losers = results[results["return_pct"] <= 0]
        scanner_preview = build_scanner(data, open_trades, args.position_size)
        summary = {
            "period": f"{args.start} to {args.end}",
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
            "strategyName": "Fresh MA50 + RSI50 signal, SPY above MA50",
            "tickerCount": len(data),
            "positionSize": args.position_size,
            "trades": int(len(results)),
            "winRate": round(float(len(winners) / len(results) * 100), 2),
            "averageReturn": round(float(results["return_pct"].mean()), 2),
            "averageWinner": round(float(winners["return_pct"].mean()), 2),
            "averageLoser": round(float(losers["return_pct"].mean()), 2),
            "averageDaysHeld": round(float(results["days_held"].mean()), 1),
            "totalPnl": round(float(results["pnl"].sum()), 2),
            "profitTargets": int((results["exit_reason"] == "profit_target").sum()),
            "stopLosses": int((results["exit_reason"] == "stop_loss").sum()),
            "maBreaks": int((results["exit_reason"] == "below_ma50").sum()),
            "openPositions": int(sum(item["status"] == "open_position" for item in scanner_preview)),
            "entrySignals": int(sum(item["status"] == "entry_signal" for item in scanner_preview)),
            "exitSignals": int(sum(item["status"] == "exit_signal" for item in scanner_preview)),
        }
        tickers = build_ticker_summary(results, list(data.keys()))
        trades = results.to_dict(orient="records")

    return {
        "summary": summary,
        "scanner": build_scanner(data, open_trades, args.position_size),
        "tickers": tickers,
        "monthly": build_monthly_summary(results, args.position_size),
        "trades": trades,
    }


def write_typescript_dashboard(data: dict, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(data, indent=2)
    output_path.write_text(
        "export const generatedBacktest = "
        + payload
        + " as const\n\nexport type GeneratedBacktest = typeof generatedBacktest\n",
        encoding="utf-8",
    )


def print_summary(results: pd.DataFrame, position_size: float) -> None:
    if results.empty:
        print("No completed trades found.")
        return

    winners = results[results["return_pct"] > 0]
    losers = results[results["return_pct"] <= 0]

    print("\nMA50 + RSI Backtest")
    print("=" * 60)
    print(f"Trades: {len(results)}")
    print(f"Win rate: {len(winners) / len(results) * 100:.1f}%")
    print(f"Average return per trade: {results['return_pct'].mean():.2f}%")
    print(f"Average winner: {winners['return_pct'].mean():.2f}%")
    print(f"Average loser: {losers['return_pct'].mean():.2f}%")
    print(f"Average days held: {results['days_held'].mean():.1f}")
    print(f"Total P&L at ${position_size:,.0f} per trade: ${results['pnl'].sum():,.2f}")

    print("\nExit Reasons")
    print(results["exit_reason"].value_counts().to_string())

    print("\nBy Ticker")
    by_ticker = results.groupby("ticker").agg(
        trades=("ticker", "count"),
        win_rate=("return_pct", lambda values: (values > 0).mean() * 100),
        avg_return=("return_pct", "mean"),
        pnl=("pnl", "sum"),
    )
    print(by_ticker.sort_values("pnl", ascending=False).round(2).to_string())

    print("\nRecent Trades")
    print(results.tail(15).to_string(index=False))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Backtest a 50-day moving average + RSI momentum strategy."
    )
    parser.add_argument("--start", default="2024-01-01")
    parser.add_argument("--end", default=date.today().isoformat())
    parser.add_argument("--tickers", nargs="+", default=DEFAULT_TICKERS)
    parser.add_argument("--position-size", type=float, default=100_000)
    parser.add_argument("--csv", type=Path, default=Path("backtest_results.csv"))
    parser.add_argument(
        "--dashboard-ts",
        type=Path,
        default=Path("src/data/generatedBacktest.ts"),
    )

    return parser.parse_args()


def main() -> None:
    args = parse_args()
    tickers = [ticker.upper() for ticker in args.tickers]
    download_tickers = sorted(set([*tickers, "SPY"]))
    data = download_data(download_tickers, args.start, args.end)
    spy = add_indicators(data["SPY"]) if "SPY" in data else None
    trades: list[Trade] = []
    open_trades: dict[str, OpenTrade] = {}

    trade_data = {ticker: frame for ticker, frame in data.items() if ticker != "SPY"}

    for ticker, frame in trade_data.items():
        ticker_trades, open_trade = backtest_ticker(ticker, frame, spy)
        trades.extend(ticker_trades)

        if open_trade is not None:
            open_trades[ticker] = open_trade

    results = summarize_trades(trades, args.position_size)

    if not results.empty:
        results = results.sort_values(["entry_date", "ticker"]).reset_index(drop=True)
        results.to_csv(args.csv, index=False)

    dashboard_data = build_dashboard_data(results, trade_data, open_trades, args)
    write_typescript_dashboard(dashboard_data, args.dashboard_ts)

    print_summary(results, args.position_size)
    print(f"\nSaved trade log to: {args.csv}")
    print(f"Saved dashboard data to: {args.dashboard_ts}")


if __name__ == "__main__":
    main()
