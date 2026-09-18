"""
Realistic (but still fully synthetic) invoices for stress-testing beyond the
clean templates in generate_synthetic_pdfs.py. Real invoices vary in label
phrasing, date format, and whether they even have a machine-readable text
layer at all — this script deliberately exercises those variations.

All vendors/amounts are fabricated. Run with:
    python generate_realistic_invoices.py
Outputs into: sample_invoices_pdf/
"""
import io
import os

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

OUT_DIR = os.path.join(os.path.dirname(__file__), "sample_invoices_pdf")
os.makedirs(OUT_DIR, exist_ok=True)


def _draw_lines(c, lines: list[str], start_y: float, x: int = 72, line_height: int = 18):
    y = start_y
    for line in lines:
        c.drawString(x, y, line)
        y -= line_height
    return y


def render_freight_style_invoice(path: str):
    """Different label phrasing throughout, a subtotal/tax/total breakdown
    (the exact pattern that exposed the Subtotal-substring bug), a
    slash-formatted date, and a "Bill To" customer block that should be
    ignored — the vendor is the letterhead "From:", not the customer.
    """
    c = canvas.Canvas(path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 740, "Freight Solutions Group")
    c.setFont("Helvetica", 9)
    c.drawString(72, 726, "1200 Harbor Way, Suite 4, Port City, ST 00000")

    c.setFont("Helvetica", 11)
    y = _draw_lines(c, [
        "From: Brightline Logistics",
        "Bill To: Acme Manufacturing (Customer)",
        "Invoice #: INV-7742",
        "PO#: PO-1002",
        "Date: 10/20/2026",
        "Due Date: 11/19/2026",
    ], start_y=690)

    y -= 12
    c.setFont("Helvetica-Bold", 11)
    c.drawString(72, y, "Line Items")
    y -= 20
    c.setFont("Helvetica", 11)
    y = _draw_lines(c, ["Freight shipping Q3 1 x $4,200.00"], start_y=y)

    y -= 12
    c.drawString(72, y, "Subtotal: $4,200.00")
    y -= 18
    c.drawString(72, y, "Tax (7%): $294.00")
    y -= 22
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, "Total Amount Due: $4,494.00")

    c.showPage()
    c.save()
    print(f"Wrote {path}")


def render_marketing_style_invoice(path: str):
    """Written-out date format (our due_date regex doesn't parse this —
    intentional, to confirm the pipeline handles a missing due_date
    gracefully instead of crashing), "Grand Total" instead of "Total Amount
    Due", and a non-standard line-item format ("Description: ... | Qty: ...
    | Rate: ...") that the current line-item regex won't parse — this is a
    known limitation, documented in the README, not silently hidden.
    """
    c = canvas.Canvas(path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 740, "INVOICE")
    c.setFont("Helvetica", 11)
    y = _draw_lines(c, [
        "Vendor: Skyline Marketing Co",
        "Invoice Number: SM-2026-118",
        "Invoice Date: October 22, 2026",
    ], start_y=706)

    y -= 12
    c.setFont("Helvetica-Bold", 11)
    c.drawString(72, y, "Services")
    y -= 20
    c.setFont("Helvetica", 10)
    y = _draw_lines(c, [
        "Description: Web banner design | Qty: 2 | Rate: $300.00",
        "Description: Social media campaign setup | Qty: 1 | Rate: $600.00",
    ], start_y=y)

    y -= 16
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, "Grand Total: $1,200.00")

    c.showPage()
    c.save()
    print(f"Wrote {path}")


def render_scanned_invoice(path: str):
    """A genuinely scanned-style invoice: rendered as an image (no text
    layer at all), then embedded into a PDF as a picture. pdfplumber's
    normal text extraction returns nothing for this file — it can only be
    read via the OCR fallback in app/services/pdf_parser.py.
    """
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new("RGB", (1000, 700), "white")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except OSError:
        font = ImageFont.load_default()
        font_bold = font

    draw.text((50, 40), "INVOICE", font=font_bold, fill="black")
    lines = [
        "Vendor: Acme Office Supplies",
        "Invoice Number: INV-9500",
        "Due Date: 2026-11-10",
        "",
        "Office chairs 3 x $150.00",
        "",
        "Total Amount Due: $450.00",
    ]
    y = 100
    for line in lines:
        draw.text((50, y), line, font=font, fill="black")
        y += 45

    # Save the rendered page as the sole content of a PDF, with no text
    # layer — simulates a scanned document dropped into the system.
    img_buffer = io.BytesIO()
    img.save(img_buffer, format="PDF")
    with open(path, "wb") as f:
        f.write(img_buffer.getvalue())
    print(f"Wrote {path} (image-only, no text layer — requires OCR)")


if __name__ == "__main__":
    render_freight_style_invoice(os.path.join(OUT_DIR, "invoice_freight_style.pdf"))
    render_marketing_style_invoice(os.path.join(OUT_DIR, "invoice_marketing_style.pdf"))
    render_scanned_invoice(os.path.join(OUT_DIR, "invoice_scanned_no_text_layer.pdf"))

    print("\n3 realistic stress-test invoices generated.")
    print("  invoice_freight_style.pdf         -> subtotal/tax breakdown, slash date, Bill To noise")
    print("  invoice_marketing_style.pdf       -> written-out date, Grand Total, non-standard line items")
    print("  invoice_scanned_no_text_layer.pdf -> image-only PDF, exercises the OCR fallback path")
