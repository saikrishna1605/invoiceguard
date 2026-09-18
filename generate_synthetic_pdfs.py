"""
Generates synthetic invoice PDFs for demoing POST /invoices/upload with real
files instead of /submit-text. All vendors, amounts, and invoice numbers are
fabricated for the hackathon demo — no real company data (GIBC Track 02
requires public/de-identified data only).

Run with: python generate_synthetic_pdfs.py
Outputs into: sample_invoices_pdf/
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

OUT_DIR = os.path.join(os.path.dirname(__file__), "sample_invoices_pdf")
os.makedirs(OUT_DIR, exist_ok=True)


def render_invoice(filename: str, vendor: str, invoice_number: str, due_date: str,
                    line_items: list[tuple[str, float, float]], total: float):
    """line_items: list of (description, qty, unit_price)"""
    path = os.path.join(OUT_DIR, filename)
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter

    y = height - 72
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, y, "INVOICE")
    y -= 32

    c.setFont("Helvetica", 11)
    c.drawString(72, y, f"Invoice Number: {invoice_number}")
    y -= 18
    c.drawString(72, y, f"Vendor: {vendor}")
    y -= 18
    c.drawString(72, y, f"Due Date: {due_date}")
    y -= 30

    c.setFont("Helvetica-Bold", 11)
    c.drawString(72, y, "Line Items")
    y -= 20
    c.setFont("Helvetica", 11)
    for desc, qty, unit_price in line_items:
        c.drawString(72, y, f"{desc} {qty:g} x ${unit_price:,.2f}")
        y -= 18

    y -= 12
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, f"Total Amount Due: ${total:,.2f}")

    c.showPage()
    c.save()
    print(f"Wrote {path}")


def render_invoice_with_po(filename: str, vendor: str, invoice_number: str, po_number: str,
                            due_date: str, line_items: list[tuple[str, float, float]], total: float):
    """Same as render_invoice but also prints a PO Number line, so the
    extractor picks it up and Retrieve matches by PO number directly
    instead of falling back to amount-proximity guessing.
    """
    path = os.path.join(OUT_DIR, filename)
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter

    y = height - 72
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, y, "INVOICE")
    y -= 32

    c.setFont("Helvetica", 11)
    c.drawString(72, y, f"Invoice Number: {invoice_number}")
    y -= 18
    c.drawString(72, y, f"Vendor: {vendor}")
    y -= 18
    c.drawString(72, y, f"PO Number: {po_number}")
    y -= 18
    c.drawString(72, y, f"Due Date: {due_date}")
    y -= 30

    c.setFont("Helvetica-Bold", 11)
    c.drawString(72, y, "Line Items")
    y -= 20
    c.setFont("Helvetica", 11)
    for desc, qty, unit_price in line_items:
        c.drawString(72, y, f"{desc} {qty:g} x ${unit_price:,.2f}")
        y -= 18

    y -= 12
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, f"Total Amount Due: ${total:,.2f}")

    c.showPage()
    c.save()
    print(f"Wrote {path}")


if __name__ == "__main__":
    # 1. Clean match — validates cleanly against PO-1001, low risk
    render_invoice(
        "invoice_clean_match.pdf",
        vendor="Acme Office Supplies",
        invoice_number="INV-9001",
        due_date="2026-10-15",
        line_items=[("Office chairs", 5, 150.00), ("Standing desks", 2, 250.00)],
        total=1250.00,
    )

    # 2. Exact duplicate of #1 — upload this AFTER invoice_clean_match.pdf
    # to trigger the duplicate-invoice-number flag.
    render_invoice(
        "invoice_duplicate.pdf",
        vendor="Acme Office Supplies",
        invoice_number="INV-9001",
        due_date="2026-10-15",
        line_items=[("Office chairs", 5, 150.00), ("Standing desks", 2, 250.00)],
        total=1250.00,
    )

    # 3. Amount anomaly — 3.3x Brightline Logistics' historical average,
    # also mismatches PO-1002's amount.
    render_invoice(
        "invoice_amount_anomaly.pdf",
        vendor="Brightline Logistics",
        invoice_number="INV-9050",
        due_date="2026-11-01",
        line_items=[("Freight shipping Q3", 1, 15000.00)],
        total=15000.00,
    )

    # 4. Unapproved vendor — Shadow Consulting LLC isn't on the approved list
    # and has no PO on file.
    render_invoice(
        "invoice_unapproved_vendor.pdf",
        vendor="Shadow Consulting LLC",
        invoice_number="INV-9099",
        due_date="2026-10-20",
        line_items=[("Strategy consulting", 1, 8000.00)],
        total=8000.00,
    )

    # 5. A second clean invoice from a different approved vendor, to show
    # the demo isn't a one-trick pony — passes validation, low risk.
    render_invoice(
        "invoice_clean_brightline.pdf",
        vendor="Brightline Logistics",
        invoice_number="INV-9051",
        due_date="2026-11-05",
        line_items=[("Freight shipping Q3", 1, 4500.00)],
        total=4500.00,
    )

    # 6. Explicit PO Number cited -> matched by PO number, not amount
    # guessing. Demonstrates the direct-reference matching path.
    render_invoice_with_po(
        "invoice_po_number_match.pdf",
        vendor="Meridian Cloud Services",
        invoice_number="INV-9200",
        po_number="PO-1003",
        due_date="2026-10-25",
        line_items=[("Cloud hosting monthly", 1, 2000.00)],
        total=2000.00,
    )

    # 7. Cites a real PO number, but one that belongs to a DIFFERENT
    # vendor than the invoice states -> flagged as a PO/vendor mismatch.
    render_invoice_with_po(
        "invoice_po_vendor_mismatch.pdf",
        vendor="Sterling Print & Signage",
        invoice_number="INV-9201",
        po_number="PO-1003",  # this PO actually belongs to Meridian
        due_date="2026-10-28",
        line_items=[("Trade show banners", 4, 200.00)],
        total=800.00,
    )

    print("\nDone. 7 PDFs generated in sample_invoices_pdf/")
    print("Upload order for the demo (via POST /invoices/upload):")
    print("  1. invoice_clean_match.pdf          -> low risk")
    print("  2. invoice_clean_brightline.pdf     -> low risk")
    print("  3. invoice_duplicate.pdf            -> high risk (duplicate)")
    print("  4. invoice_amount_anomaly.pdf       -> high risk (anomaly + PO mismatch)")
    print("  5. invoice_unapproved_vendor.pdf    -> high risk (unapproved vendor + KB policy hold)")
    print("  6. invoice_po_number_match.pdf      -> low risk (matched via explicit PO Number)")
    print("  7. invoice_po_vendor_mismatch.pdf   -> flagged (PO Number belongs to a different vendor)")
