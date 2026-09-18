"""
Seeds synthetic vendors + purchase orders, all fabricated for demo purposes
(no real company/vendor data), per GIBC Track 02's public/de-identified
data requirement.

Run with: python -m app.seed_data
"""
from app.database import Base, engine, SessionLocal
from app.models import Vendor, PurchaseOrder

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        if db.query(Vendor).count() > 0:
            print("Data already seeded, skipping.")
            return

        acme = Vendor(name="Acme Office Supplies", approved=True,
                      avg_invoice_amount=1200.0, invoice_count=8)
        brightline = Vendor(name="Brightline Logistics", approved=True,
                             avg_invoice_amount=4500.0, invoice_count=5)
        shadow = Vendor(name="Shadow Consulting LLC", approved=False,
                         avg_invoice_amount=0.0, invoice_count=0)
        meridian = Vendor(name="Meridian Cloud Services", approved=True,
                           avg_invoice_amount=2000.0, invoice_count=6)
        sterling = Vendor(name="Sterling Print & Signage", approved=True,
                           avg_invoice_amount=800.0, invoice_count=3)
        db.add_all([acme, brightline, shadow, meridian, sterling])
        db.commit()
        for v in (acme, brightline, shadow, meridian, sterling):
            db.refresh(v)

        pos = [
            PurchaseOrder(
                po_number="PO-1001",
                vendor_id=acme.id,
                amount=1250.00,
                line_items=[
                    {"description": "Office chairs", "qty": 5, "unit_price": 150.0},
                    {"description": "Standing desks", "qty": 2, "unit_price": 250.0},
                ],
            ),
            PurchaseOrder(
                po_number="PO-1002",
                vendor_id=brightline.id,
                amount=4500.00,
                line_items=[
                    {"description": "Freight shipping Q3", "qty": 1, "unit_price": 4500.0},
                ],
            ),
            PurchaseOrder(
                po_number="PO-1003",
                vendor_id=meridian.id,
                amount=2000.00,
                line_items=[
                    {"description": "Cloud hosting monthly", "qty": 1, "unit_price": 2000.0},
                ],
            ),
            PurchaseOrder(
                po_number="PO-1004",
                vendor_id=sterling.id,
                amount=800.00,
                line_items=[
                    {"description": "Trade show banners", "qty": 4, "unit_price": 200.0},
                ],
            ),
        ]
        db.add_all(pos)
        db.commit()
        print("Seeded 5 vendors and 4 purchase orders.")
    finally:
        db.close()


SAMPLE_INVOICES = {
    "clean_match.txt": """
Invoice Number: INV-9001
Vendor: Acme Office Supplies
Due Date: 2026-10-15
Office chairs 5 x $150.00
Standing desks 2 x $250.00
Total Amount Due: $1250.00
""",
    "duplicate.txt": """
Invoice Number: INV-9001
Vendor: Acme Office Supplies
Due Date: 2026-10-15
Office chairs 5 x $150.00
Standing desks 2 x $250.00
Total Amount Due: $1250.00
""",
    "amount_anomaly.txt": """
Invoice Number: INV-9050
Vendor: Brightline Logistics
Due Date: 2026-11-01
Freight shipping Q3 1 x $15000.00
Total Amount Due: $15000.00
""",
    "unapproved_vendor.txt": """
Invoice Number: INV-9099
Vendor: Shadow Consulting LLC
Due Date: 2026-10-20
Strategy consulting 1 x $8000.00
Total Amount Due: $8000.00
""",
    "po_number_direct_match.txt": """
Invoice Number: INV-9200
Vendor: Meridian Cloud Services
PO Number: PO-1003
Due Date: 2026-10-25
Cloud hosting monthly 1 x $2000.00
Total Amount Due: $2000.00
""",
    "po_vendor_mismatch.txt": """
Invoice Number: INV-9201
Vendor: Sterling Print & Signage
PO Number: PO-1003
Due Date: 2026-10-28
Trade show banners 4 x $200.00
Total Amount Due: $800.00
""",
}

if __name__ == "__main__":
    seed()
    print("\nSample invoice texts available in SAMPLE_INVOICES for quick testing via")
    print("POST /invoices/submit-text (form field 'raw_text').")
    print("Try them in this order to see each risk path:")
    print("  1. clean_match.txt            -> low risk, validates cleanly")
    print("  2. duplicate.txt              -> flagged as duplicate of INV-9001")
    print("  3. amount_anomaly.txt         -> flagged, 3.3x vendor's average")
    print("  4. unapproved_vendor.txt      -> flagged, vendor not approved + KB policy hold")
    print("  5. po_number_direct_match.txt -> matched via explicit PO Number, not amount guessing")
    print("  6. po_vendor_mismatch.txt     -> PO Number cited belongs to a DIFFERENT vendor -> flagged")
