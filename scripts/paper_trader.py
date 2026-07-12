from __future__ import annotations

import argparse
import json
import time
from datetime import datetime
from pathlib import Path

from backtest_ma_rsi import DEFAULT_TICKERS, add_indicators, download_data


STARTING_CASH = 500_000
POSITION_SIZE = 100_000
MAX_POSITIONS = 5


def default_state() -> dict:
    return {
        "mode": "paper",
        "startingCash": STARTING_CASH,
        "cash": STARTING_CASH,
        "positionSize": POSITION_SIZE,
        "maxPositions": MAX_POSITIONS,
        "realizedPnl": 0,
        "updatedAt": None,
        "positions": [],
        "trades": [],
        "skippedSignals": [],
        "lastSignalDates": {},
    }


def load_state(path: Path) -> dict:
    if not path.exists():
        return default_state()

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default_state()


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2), encoding="utf-8")


def is_spy_healthy(spy, current_date) -> bool:
    if spy is None or current_date not in spy.index:
        return False

    spy_row = spy.loc[current_date]

    return bool(spy_row["Close"] >= spy_row["ma50"])


def has_open_position(state: dict, ticker: str) -> bool:
    return any(position["ticker"] == ticker for position in state["positions"])


def mark_to_market(state: dict, data: dict[str, object]) -> None:
    total_value = float(state["cash"])

    for position in state["positions"]:
        frame = data.get(position["ticker"])

        if frame is None:
            position["currentPrice"] = position["entryPrice"]
            position["unrealizedPnl"] = 0
        else:
            latest = frame.iloc[-1]
            position["currentPrice"] = round(float(latest["Close"]), 2)
            position["unrealizedPnl"] = round(
                (position["currentPrice"] - position["entryPrice"]) * position["shares"],
                2,
            )

        total_value += position["shares"] * position["currentPrice"]

    state["equity"] = round(total_value, 2)
    state["totalPnl"] = round(total_value - state["startingCash"], 2)


def close_position(state: dict, position: dict, exit_price: float, exit_date: str, reason: str) -> None:
    proceeds = position["shares"] * exit_price
    pnl = (exit_price - position["entryPrice"]) * position["shares"]
    state["cash"] = round(float(state["cash"]) + proceeds, 2)
    state["realizedPnl"] = round(float(state["realizedPnl"]) + pnl, 2)
    state["trades"].append(
        {
            "ticker": position["ticker"],
            "entryDate": position["entryDate"],
            "exitDate": exit_date,
            "entryPrice": position["entryPrice"],
            "exitPrice": round(exit_price, 2),
            "shares": round(position["shares"], 4),
            "pnl": round(pnl, 2),
            "returnPct": round((exit_price / position["entryPrice"] - 1) * 100, 2),
            "reason": reason,
        }
    )


def process_exits(state: dict, data: dict[str, object]) -> None:
    remaining_positions = []

    for position in state["positions"]:
        frame = data.get(position["ticker"])

        if frame is None:
            remaining_positions.append(position)
            continue

        frame = add_indicators(frame)
        latest = frame.iloc[-1]
        current_date = frame.index[-1].date().isoformat()
        exit_price = None
        reason = None

        if float(latest["Low"]) <= position["stopPrice"]:
            exit_price = position["stopPrice"]
            reason = "Stop"
        elif float(latest["High"]) >= position["targetPrice"]:
            exit_price = position["targetPrice"]
            reason = "Target"
        elif float(latest["Close"]) < float(latest["ma50"]):
            exit_price = float(latest["Close"])
            reason = "MA break"

        if exit_price is None or reason is None:
            remaining_positions.append(position)
        else:
            close_position(state, position, exit_price, current_date, reason)

    state["positions"] = remaining_positions


def process_entries(state: dict, data: dict[str, object], spy) -> None:
    state["skippedSignals"] = []

    for ticker in sorted(data):
        if ticker == "SPY" or has_open_position(state, ticker):
            continue

        frame = add_indicators(data[ticker])
        latest = frame.iloc[-1]
        current_date = frame.index[-1]
        date_key = current_date.date().isoformat()

        if not bool(latest["fresh_entry_signal"]):
            continue

        if state["lastSignalDates"].get(ticker) == date_key:
            continue

        state["lastSignalDates"][ticker] = date_key

        if not is_spy_healthy(spy, current_date):
            state["skippedSignals"].append({"ticker": ticker, "date": date_key, "reason": "SPY below MA50"})
            continue

        if len(state["positions"]) >= state["maxPositions"]:
            state["skippedSignals"].append({"ticker": ticker, "date": date_key, "reason": "Max positions"})
            continue

        if float(state["cash"]) < state["positionSize"]:
            state["skippedSignals"].append({"ticker": ticker, "date": date_key, "reason": "Not enough cash"})
            continue

        entry_price = float(latest["Close"])
        shares = state["positionSize"] / entry_price
        state["cash"] = round(float(state["cash"]) - state["positionSize"], 2)
        state["positions"].append(
            {
                "ticker": ticker,
                "entryDate": date_key,
                "entryPrice": round(entry_price, 2),
                "shares": shares,
                "targetPrice": round(entry_price * 1.05, 2),
                "stopPrice": round(entry_price * 0.98, 2),
                "currentPrice": round(entry_price, 2),
                "unrealizedPnl": 0,
            }
        )


def run_once(state_path: Path, tickers: list[str]) -> None:
    state = load_state(state_path)
    data = download_data([*tickers, "SPY"], start="2024-01-01", end=datetime.now().date().isoformat())
    spy = add_indicators(data["SPY"]) if "SPY" in data else None

    process_exits(state, data)
    process_entries(state, data, spy)
    mark_to_market(state, data)

    state["updatedAt"] = datetime.now().isoformat(timespec="seconds")
    state["trades"] = state["trades"][-200:]
    save_state(state_path, state)

    print(
        f"[{state['updatedAt']}] equity=${state['equity']:,.2f} "
        f"cash=${state['cash']:,.2f} positions={len(state['positions'])}"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local paper trading simulation.")
    parser.add_argument("--tickers", nargs="+", default=DEFAULT_TICKERS)
    parser.add_argument("--interval", type=int, default=60)
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--state", type=Path, default=Path("public/paper-trading.json"))

    return parser.parse_args()


def main() -> None:
    args = parse_args()
    tickers = [ticker.upper() for ticker in args.tickers]

    while True:
        run_once(args.state, tickers)

        if args.once:
            break

        time.sleep(args.interval)


if __name__ == "__main__":
    main()
