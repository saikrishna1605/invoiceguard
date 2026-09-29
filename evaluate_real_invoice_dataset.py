from pathlib import Path
import pandas as pd

ANOMALY_MULTIPLIER = 2.5

DATA_ROOT = Path(
    "data/real_invoices/"
    "Atomic Common-Day Invoice Clearing Pseudonymized I/"
    "data/annual_inputs"
)

TRAIN_YEARS = list(range(2012, 2023))
TEST_YEAR = 2023


def load_year(year: int) -> pd.DataFrame:
    path = DATA_ROOT / f"{year}.csv"
    df = pd.read_csv(path)

    df["amount_eur"] = df["amount_cents"] / 100.0
    df["issue_date"] = pd.to_datetime(df["issue_date"])
    df["due_date"] = pd.to_datetime(df["due_date"])

    return df


def main():
    print("InvoiceGuard — Real Invoice Dataset Evaluation")
    print("=" * 55)

    # ---------------------------------------------------------
    # 1. Historical data
    # ---------------------------------------------------------
    print(f"\nLoading historical years {TRAIN_YEARS[0]}-{TRAIN_YEARS[-1]}...")

    history = pd.concat(
        [load_year(year) for year in TRAIN_YEARS],
        ignore_index=True,
    )

    test = load_year(TEST_YEAR)

    print(f"Historical invoices: {len(history):,}")
    print(f"Test invoices ({TEST_YEAR}): {len(test):,}")

    # ---------------------------------------------------------
    # 2. Build historical creditor/vendor profiles
    # ---------------------------------------------------------
    profiles = (
        history.groupby("creditor")["amount_eur"]
        .agg(
            vendor_avg_amount="mean",
            vendor_median_amount="median",
            vendor_invoice_count="count",
        )
        .reset_index()
    )

    print(f"Historical creditors/vendors: {len(profiles):,}")

    # ---------------------------------------------------------
    # 3. Apply historical context to unseen 2023 invoices
    # ---------------------------------------------------------
    evaluated = test.merge(
        profiles,
        on="creditor",
        how="left",
    )

    evaluated["vendor_found"] = evaluated["vendor_invoice_count"].notna()

    evaluated["amount_multiplier"] = (
        evaluated["amount_eur"] / evaluated["vendor_avg_amount"]
    )

    # Same core amount anomaly rule used by InvoiceGuard AssessAgent
    evaluated["amount_anomaly"] = (
        evaluated["vendor_found"]
        & (evaluated["amount_multiplier"] >= ANOMALY_MULTIPLIER)
    )

    # Existing InvoiceGuard logic:
    # unknown vendor = +15
    # amount anomaly = +30
    evaluated["risk_score"] = 0

    evaluated.loc[
        ~evaluated["vendor_found"],
        "risk_score",
    ] += 15

    evaluated.loc[
        evaluated["amount_anomaly"],
        "risk_score",
    ] += 30

    # We intentionally do NOT add PO-validation penalties because
    # this public dataset does not contain purchase-order records.
    evaluated["risk_level"] = "low"

    evaluated.loc[
        evaluated["risk_score"] >= 20,
        "risk_level",
    ] = "medium"

    evaluated.loc[
        evaluated["risk_score"] >= 50,
        "risk_level",
    ] = "high"

    # ---------------------------------------------------------
    # 4. Payment-term empirical analysis
    # ---------------------------------------------------------
    evaluated["payment_terms_days"] = (
        evaluated["due_date"] - evaluated["issue_date"]
    ).dt.days

    # ---------------------------------------------------------
    # 5. Summary
    # ---------------------------------------------------------
    total = len(evaluated)
    known = int(evaluated["vendor_found"].sum())
    unknown = total - known
    anomalies = int(evaluated["amount_anomaly"].sum())

    print("\nEMPIRICAL RESULTS")
    print("-" * 55)

    print(f"Evaluated invoices:       {total:,}")
    print(f"Known creditors:          {known:,}")
    print(f"First-seen creditors:     {unknown:,}")
    print(f"Amount anomalies >=2.5x:  {anomalies:,}")

    if total:
        print(f"Amount anomaly rate:      {anomalies / total * 100:.2f}%")

    print("\nRisk distribution:")
    print(evaluated["risk_level"].value_counts().to_string())

    print("\nPayment-term statistics (days):")
    print(evaluated["payment_terms_days"].describe().round(2).to_string())

    # ---------------------------------------------------------
    # 6. Top anomalies
    # ---------------------------------------------------------
    top = (
        evaluated[
            evaluated["vendor_found"]
            & evaluated["amount_multiplier"].notna()
        ]
        .sort_values("amount_multiplier", ascending=False)
        [
            [
                "uid",
                "debtor",
                "creditor",
                "amount_eur",
                "vendor_avg_amount",
                "vendor_invoice_count",
                "amount_multiplier",
                "risk_score",
                "risk_level",
            ]
        ]
        .head(20)
    )

    print("\nTOP 20 AMOUNT ANOMALIES")
    print("-" * 55)

    if top.empty:
        print("No comparable historical creditors found.")
    else:
        print(top.to_string(index=False))

    # ---------------------------------------------------------
    # 7. Save reproducible results
    # ---------------------------------------------------------
    output_dir = Path("evaluation_results")
    output_dir.mkdir(exist_ok=True)

    evaluated.to_csv(
        output_dir / "real_invoice_evaluation_2023.csv",
        index=False,
    )

    top.to_csv(
        output_dir / "top_20_real_invoice_anomalies.csv",
        index=False,
    )

    summary = pd.DataFrame(
        [
            {
                "historical_years": "2012-2022",
                "test_year": TEST_YEAR,
                "historical_records": len(history),
                "test_records": total,
                "known_creditor_records": known,
                "first_seen_creditor_records": unknown,
                "amount_anomalies": anomalies,
                "amount_anomaly_rate_pct": (
                    round(anomalies / total * 100, 4)
                    if total
                    else 0
                ),
                "anomaly_multiplier": ANOMALY_MULTIPLIER,
            }
        ]
    )

    summary.to_csv(
        output_dir / "real_invoice_evaluation_summary.csv",
        index=False,
    )

    print("\nSaved:")
    print(" evaluation_results/real_invoice_evaluation_2023.csv")
    print(" evaluation_results/top_20_real_invoice_anomalies.csv")
    print(" evaluation_results/real_invoice_evaluation_summary.csv")


if __name__ == "__main__":
    main()