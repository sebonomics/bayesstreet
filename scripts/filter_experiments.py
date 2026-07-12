from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date
from pathlib import Path

import pandas as pd

from backtest_ma_rsi import (
    DEFAULT_TICKERS,
    Trade,
    add_indicators,
    download_data,
    summarize_trades,
)


@dataclass
class FilterConfig:
    name: str
    stock_above_ma200: bool = False
    spy_above_ma50: bool = False
    spy_above_ma200: bool = False
    cooldown_after_loss_days: int = 0
    min_rsi: float = 50
    max_ma50_distance_pct: float | None = None


CONFIGS = [
    FilterConfig("Baseline"),
    FilterConfig("Stock above MA200", stock_above_ma200=True),
    FilterConfig("SPY above MA50", spy_above_ma50=True),
    FilterConfig("SPY above MA200", spy_above_ma200=True),
    FilterConfig("5-day cooldown", cooldown_after_loss_days=5),
    FilterConfig("RSI >= 55", min_rsi=55),
    FilterConfig("Price within 2% of MA50", max_ma50_distance_pct=2),
    FilterConfig("Price within 1% of MA50", max_ma50_distance_pct=1),
    FilterConfig("Stock MA200 + within 2% of MA50", stock_above_ma200=True, max_ma50_distance_pct=2),
    FilterConfig("SPY MA50 + within 2% of MA50", spy_above_ma50=True, max_ma50_distance_pct=2),
    FilterConfig(
        "Stock MA200 + SPY MA200 + cooldown",
        stock_above_ma200=True,
        spy_above_ma200=True,
        cooldown_after_loss_days=5,
    ),
]


def passes_filters(
    row: pd.Series,
    current_date: pd.Timestamp,
    spy: pd.DataFrame,
    config: FilterConfig,
    cooldown_until: pd.Timestamp | None,
) -> bool:
    if cooldown_until is not None and current_date <= cooldown_until:
        return False

    if config.stock_above_ma200 and not bool(row["Close"] >= row["ma200"]):
        return False

    if float(row["rsi14"]) < config.min_rsi:
        return False

    if config.max_ma50_distance_pct is not None:
        distance_pct = (float(row["Close"]) / float(row["ma50"]) - 1) * 100

        if distance_pct > config.max_ma50_distance_pct:
            return False

    if config.spy_above_ma50 or config.spy_above_ma200:
        if current_date not in spy.index:
            return False

        spy_row = spy.loc[current_date]

        if config.spy_above_ma50 and not bool(spy_row["Close"] >= spy_row["ma50"]):
            return False

        if config.spy_above_ma200 and not bool(spy_row["Close"] >= spy_row["ma200"]):
            return False

    return True


def backtest_with_filters(
    ticker: str,
    frame: pd.DataFrame,
    spy: pd.DataFrame,
    config: FilterConfig,
    trade_start: str,
) -> list[Trade]:
    frame = add_indicators(frame)
    frame["ma200"] = frame["Close"].rolling(200).mean()
    frame = frame[frame.index >= trade_start]

    trades: list[Trade] = []
    open_trade: tuple[pd.Timestamp, float] | None = None
    cooldown_until: pd.Timestamp | None = None

    for current_date, row in frame.iterrows():
        if open_trade is None:
            if bool(row["fresh_entry_signal"]) and passes_filters(
                row,
                current_date,
                spy,
                config,
                cooldown_until,
            ):
                open_trade = (current_date, float(row["Close"]))
            continue

        entry_date, entry_price = open_trade
        target_price = entry_price * 1.05
        stop_price = entry_price * 0.98
        exit_price: float | None = None
        exit_reason: str | None = None

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

            if exit_price <= entry_price and config.cooldown_after_loss_days > 0:
                cooldown_until = current_date + pd.Timedelta(days=config.cooldown_after_loss_days)

    return trades


def summarize_config(name: str, trades: list[Trade], position_size: float) -> dict:
    results = summarize_trades(trades, position_size)

    if results.empty:
        return {
            "name": name,
            "trades": 0,
            "winRate": 0,
            "averageReturn": 0,
            "averageWinner": 0,
            "averageLoser": 0,
            "averageDaysHeld": 0,
            "totalPnl": 0,
        }

    winners = results[results["return_pct"] > 0]
    losers = results[results["return_pct"] <= 0]

    return {
        "name": name,
        "trades": int(len(results)),
        "winRate": round(float(len(winners) / len(results) * 100), 2),
        "averageReturn": round(float(results["return_pct"].mean()), 2),
        "averageWinner": round(float(winners["return_pct"].mean()), 2),
        "averageLoser": round(float(losers["return_pct"].mean()), 2),
        "averageDaysHeld": round(float(results["days_held"].mean()), 1),
        "totalPnl": round(float(results["pnl"].sum()), 2),
    }


def write_typescript(results: list[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "export const filterExperiments = "
        + json.dumps(results, indent=2)
        + " as const\n",
        encoding="utf-8",
    )


def main() -> None:
    trade_start = "2024-01-01"
    data_start = "2023-01-01"
    end = date.today().isoformat()
    position_size = 100_000
    data = download_data([*DEFAULT_TICKERS, "SPY"], data_start, end)
    spy = add_indicators(data["SPY"])
    spy["ma200"] = spy["Close"].rolling(200).mean()
    summaries = []

    for config in CONFIGS:
        trades = [
            trade
            for ticker, frame in data.items()
            if ticker != "SPY"
            for trade in backtest_with_filters(ticker, frame, spy, config, trade_start)
        ]
        summaries.append(summarize_config(config.name, trades, position_size))

    write_typescript(summaries, Path("src/data/filterExperiments.ts"))

    print("\nFilter Experiments")
    print("=" * 80)
    for row in summaries:
        print(
            f"{row['name']}: trades={row['trades']}, "
            f"win={row['winRate']}%, avg={row['averageReturn']}%, "
            f"pnl=${row['totalPnl']:,.2f}"
        )


if __name__ == "__main__":
    main()
