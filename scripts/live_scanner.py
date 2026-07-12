from __future__ import annotations

import argparse
import json
import time
from datetime import datetime
from pathlib import Path

from backtest_ma_rsi import DEFAULT_TICKERS, add_indicators, download_data


def status_for_row(row, previous_row) -> str:
    if bool(row["fresh_entry_signal"]):
        return "entry_signal"

    if row["Close"] < row["ma50"] and previous_row["Close"] >= previous_row["ma50"]:
        return "trend_break"

    return "watch"


def action_for_status(status: str) -> str:
    if status == "entry_signal":
        return "Buy candidate"

    if status == "trend_break":
        return "Trend broke"

    return "Do nothing"


def scan_once(tickers: list[str], output_path: Path) -> None:
    data = download_data([*tickers, "SPY"], start="2024-01-01", end=datetime.now().date().isoformat())
    spy = add_indicators(data["SPY"]) if "SPY" in data else None
    scanner = []

    for ticker, frame in data.items():
        if ticker == "SPY":
            continue

        frame = add_indicators(frame)

        if len(frame) < 2:
            continue

        latest = frame.iloc[-1]
        previous = frame.iloc[-2]
        status = status_for_row(latest, previous)

        if status == "entry_signal":
            if spy is None or frame.index[-1] not in spy.index:
                status = "watch"
            else:
                spy_row = spy.loc[frame.index[-1]]
                if not bool(spy_row["Close"] >= spy_row["ma50"]):
                    status = "watch"

        current_price = float(latest["Close"])
        target_price = current_price * 1.05 if status == "entry_signal" else None
        stop_price = current_price * 0.98 if status == "entry_signal" else None

        scanner.append(
            {
                "ticker": ticker,
                "date": frame.index[-1].date().isoformat(),
                "status": status,
                "action": action_for_status(status),
                "currentPrice": round(current_price, 2),
                "ma50": None if latest["ma50"] != latest["ma50"] else round(float(latest["ma50"]), 2),
                "rsi14": None if latest["rsi14"] != latest["rsi14"] else round(float(latest["rsi14"]), 1),
                "targetPrice": None if target_price is None else round(target_price, 2),
                "stopPrice": None if stop_price is None else round(stop_price, 2),
                "unrealizedReturnPct": 0,
                "unrealizedPnl": 0,
            }
        )

    order = {"entry_signal": 0, "trend_break": 1, "watch": 2}
    scanner = sorted(scanner, key=lambda item: (order[item["status"]], item["ticker"]))
    payload = {
        "mode": "live_scanner",
        "dataSource": "Yahoo Finance via yfinance",
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "refreshNote": "Local scanner refreshes while scripts/live_scanner.py is running.",
        "summary": {
            "tickerCount": len(scanner),
            "entrySignals": sum(item["status"] == "entry_signal" for item in scanner),
            "trendBreaks": sum(item["status"] == "trend_break" for item in scanner),
            "watching": sum(item["status"] == "watch" for item in scanner),
        },
        "scanner": scanner,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(
        f"[{payload['generatedAt']}] wrote {len(scanner)} tickers "
        f"({payload['summary']['entrySignals']} entry signals)"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a local live MA50 + RSI scanner.")
    parser.add_argument("--tickers", nargs="+", default=DEFAULT_TICKERS)
    parser.add_argument("--interval", type=int, default=60)
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--output", type=Path, default=Path("public/live-dashboard.json"))

    return parser.parse_args()


def main() -> None:
    args = parse_args()
    tickers = [ticker.upper() for ticker in args.tickers]

    while True:
        scan_once(tickers, args.output)

        if args.once:
            break

        time.sleep(args.interval)


if __name__ == "__main__":
    main()
