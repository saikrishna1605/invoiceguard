"""
Downloads N rows from the GokulRajaR/invoice-ocr-json Hugging Face dataset,
uploads each invoice image to your running InvoiceGuard API, and prints a
side-by-side accuracy report comparing extracted fields against the
dataset's own ground-truth labels.

SAFETY FILTER: the dataset card claims all invoices are synthetic, but
several rows in the actual data show real-looking company names (e.g.
"GOODRICH CORPORATION", "CANON CANADA INC.") with no Faker-style tax_id/iban
fields — inconsistent with that claim. This script only pulls rows whose
seller/vendor record includes a tax_id or iban field, which is the
Faker-library signature and a reliable "definitely synthetic" marker. Rows
without one are skipped, not used, regardless of N.

Prerequisites:
    pip install datasets requests
    # InvoiceGuard API must already be running: uvicorn app.main:app

Usage:
    python compare_against_hf_dataset.py --n 10
    python compare_against_hf_dataset.py --n 20 --api-base http://127.0.0.1:8000
"""
import argparse
import json
import os

IMAGE_DIR = "hf_comparison_images"


def normalize_ground_truth(data: dict) -> dict:
    """Field names vary row to row in this dataset (seller/vendor/bill_from,
    invoice_number/invoice_no, due_date/date_due, etc.) — this pulls out a
    consistent shape to compare against our extractor's output.
    """
    seller = data.get("seller") or data.get("vendor") or data.get("bill_from") or {}
    invoice_number = data.get("invoice_number") or data.get("invoice_no")
    due_date = data.get("due_date") or data.get("date_due")
    items = data.get("items") or []

    total_amount = data.get("total_amount") or data.get("amount_due")
    if total_amount is None and items:
        computed = 0.0
        for item in items:
            amount = item.get("amount") or item.get("total") or item.get("total_price")
            if amount is None:
                qty = item.get("quantity") or item.get("qty") or 0
                price = item.get("unit_price") or item.get("price") or 0
                amount = qty * price
            computed += amount or 0
        total_amount = computed if computed else None

    return {
        "vendor_name": seller.get("name"),
        "invoice_number": invoice_number,
        "due_date": due_date,
        "total_amount": total_amount,
    }


def is_safe_synthetic(data: dict) -> bool:
    """Faker-generated rows include a tax_id or iban on the seller/vendor
    record — real company data in this dataset does not. This is the only
    reliable "definitely synthetic" signal available, so rows without it
    are excluded rather than guessed at.
    """
    seller = data.get("seller") or data.get("vendor") or data.get("bill_from") or {}
    return "tax_id" in seller or "iban" in seller or "IBAN" in seller


def fuzzy_match(a, b) -> bool:
    if a is None or b is None:
        return False
    a, b = str(a).strip().lower(), str(b).strip().lower()
    return a == b or a in b or b in a


def amount_match(a, b, tolerance_pct=2.0) -> bool:
    if a is None or b is None:
        return False
    try:
        a, b = float(a), float(b)
    except (TypeError, ValueError):
        return False
    if b == 0:
        return a == 0
    return abs(a - b) / abs(b) * 100 <= tolerance_pct


def run_comparison(n: int, api_base: str, split: str):
    try:
        from datasets import load_dataset
    except ImportError:
        print("Missing dependency. Run: pip install datasets")
        return

    try:
        import requests
    except ImportError:
        print("Missing dependency. Run: pip install requests")
        return

    print(f"Loading GokulRajaR/invoice-ocr-json [{split}] ...")
    ds = load_dataset("GokulRajaR/invoice-ocr-json", split=split)

    os.makedirs(IMAGE_DIR, exist_ok=True)

    results = []
    checked = 0
    for row in ds:
        if checked >= n:
            break

        try:
            gt_raw = json.loads(row["data"]) if isinstance(row["data"], str) else row["data"]
        except (json.JSONDecodeError, TypeError):
            continue

        if not is_safe_synthetic(gt_raw):
            continue  # real-looking row — skip regardless of N

        ground_truth = normalize_ground_truth(gt_raw)
        image_path = os.path.join(IMAGE_DIR, f"hf_invoice_{checked}.jpg")
        row["file"].convert("RGB").save(image_path)

        try:
            with open(image_path, "rb") as f:
                resp = requests.post(f"{api_base}/invoices/upload", files={"file": f}, timeout=30)
            resp.raise_for_status()
            extracted = resp.json().get("extracted_data", {})
        except Exception as e:
            print(f"Row {checked}: API call failed ({e}) — is the server running at {api_base}?")
            checked += 1
            continue

        row_result = {
            "row": checked,
            "vendor_name": (ground_truth["vendor_name"], extracted.get("vendor_name"),
                             fuzzy_match(ground_truth["vendor_name"], extracted.get("vendor_name"))),
            "invoice_number": (ground_truth["invoice_number"], extracted.get("invoice_number"),
                                fuzzy_match(ground_truth["invoice_number"], extracted.get("invoice_number"))),
            "total_amount": (ground_truth["total_amount"], extracted.get("amount"),
                              amount_match(ground_truth["total_amount"], extracted.get("amount"))),
        }
        results.append(row_result)
        checked += 1

    if not results:
        print("No comparable rows found — check dataset access and API availability.")
        return

    print(f"\n{'Row':<5} {'Field':<16} {'Ground Truth':<35} {'Extracted':<35} {'Match'}")
    print("-" * 100)
    field_hits = {"vendor_name": 0, "invoice_number": 0, "total_amount": 0}
    for r in results:
        for field in ("vendor_name", "invoice_number", "total_amount"):
            gt, ext, ok = r[field]
            field_hits[field] += int(ok)
            print(f"{r['row']:<5} {field:<16} {str(gt)[:33]:<35} {str(ext)[:33]:<35} {'✓' if ok else '✗'}")

    total = len(results)
    print("\n=== Summary ===")
    print(f"Rows compared: {total}")
    for field, hits in field_hits.items():
        print(f"{field}: {hits}/{total} ({hits / total * 100:.0f}%)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--n", type=int, default=10, help="Number of safe-synthetic rows to test")
    parser.add_argument("--api-base", default="http://127.0.0.1:8000", help="Running InvoiceGuard API base URL")
    parser.add_argument("--split", default="test", choices=["train", "validation", "test"])
    args = parser.parse_args()
    run_comparison(args.n, args.api_base, args.split)
