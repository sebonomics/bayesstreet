from __future__ import annotations

import pandas as pd


STARTING_CASH = 500_000


def size_fixed_25k(open_count: int) -> int:
    return 25_000


def size_fixed_50k(open_count: int) -> int:
    return 50_000


def size_dynamic(open_count: int) -> int:
    if open_count <= 4:
        return 50_000

    if open_count <= 9:
        return 35_000

    return 25_000


def simulate(name: str, size_fn) -> dict:
    trades = pd.read_csv("backtest_results.csv", parse_dates=["entry_date", "exit_date"])
    cash = STARTING_CASH
    open_positions = []
    closed = []
    skipped = 0
    daily_rows = []
    all_days = pd.date_range(trades["entry_date"].min(), trades["exit_date"].max(), freq="D")

    for current_day in all_days:
        still_open = []

        for position in open_positions:
            if position["exit_date"] <= current_day:
                cash += position["size"] + position["pnl"]
                closed.append(position)
            else:
                still_open.append(position)

        open_positions = still_open

        entries_today = trades[trades["entry_date"] == current_day].sort_values("ticker")

        for _, trade in entries_today.iterrows():
            size = size_fn(len(open_positions))

            if cash < size:
                skipped += 1
                continue

            cash -= size
            open_positions.append(
                {
                    "ticker": trade["ticker"],
                    "entry_date": trade["entry_date"],
                    "exit_date": trade["exit_date"],
                    "size": size,
                    "pnl": size * trade["return_pct"] / 100,
                    "return_pct": trade["return_pct"],
                }
            )

        deployed = sum(position["size"] for position in open_positions)
        daily_rows.append(
            {
                "date": current_day,
                "openPositions": len(open_positions),
                "deployed": deployed,
                "utilizationPct": deployed / STARTING_CASH * 100,
            }
        )

    closed.extend(open_positions)
    closed_df = pd.DataFrame(closed)
    daily = pd.DataFrame(daily_rows)

    closed_df["year"] = closed_df["exit_date"].dt.year
    yearly = (
        closed_df.groupby("year")
        .agg(trades=("ticker", "count"), pnl=("pnl", "sum"))
        .reset_index()
    )
    yearly["returnPct"] = yearly["pnl"] / STARTING_CASH * 100

    return {
        "name": name,
        "trades": int(len(closed_df)),
        "skipped": int(skipped),
        "totalPnl": round(float(closed_df["pnl"].sum()), 2),
        "totalReturnPct": round(float(closed_df["pnl"].sum() / STARTING_CASH * 100), 2),
        "avgUtilizationPct": round(float(daily["utilizationPct"].mean()), 2),
        "medianUtilizationPct": round(float(daily["utilizationPct"].median()), 2),
        "maxPositions": int(daily["openPositions"].max()),
        "yearly": [
            {
                "year": int(row["year"]),
                "trades": int(row["trades"]),
                "pnl": round(float(row["pnl"]), 2),
                "returnPct": round(float(row["returnPct"]), 2),
            }
            for _, row in yearly.iterrows()
        ],
    }


def main() -> None:
    results = [
        simulate("Fixed $25k", size_fixed_25k),
        simulate("Fixed $50k", size_fixed_50k),
        simulate("Dynamic $25k-$50k", size_dynamic),
    ]

    print("\nPosition Sizing Experiments")
    print("=" * 80)
    for result in results:
        print(
            f"{result['name']}: total={result['totalReturnPct']}%, "
            f"pnl=${result['totalPnl']:,.2f}, skipped={result['skipped']}, "
            f"avg_util={result['avgUtilizationPct']}%"
        )
        for year in result["yearly"]:
            print(f"  {year['year']}: {year['returnPct']}% (${year['pnl']:,.2f})")


if __name__ == "__main__":
    main()
